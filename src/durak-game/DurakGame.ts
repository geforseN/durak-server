import { GameSettings } from "../namespaces/lobbies/lobbies.types";
import Lobby from "../namespaces/lobbies/entity/lobby";
import Players from "./entity/Players/Players";
import Discard from "./entity/Deck/Discard";
import Talon from "./entity/Deck/Talon";
import Desk from "./entity/Desk";
import { LobbyUserIdentifier } from "../namespaces/lobbies/entity/lobby-users";
import { GameSocket, GameService } from "../namespaces/games/game.service";
import { GamesIO, PlayerRole } from "../namespaces/games/games.types";
import Card from "./entity/Card";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";
import Player, { CardRemove } from "./entity/Players/Player";
import GameRound from "./entity/GameRound";
import { durakGames } from "../index";

export type GameInfo = { id: string, adminAccname: string };
export type CardInfo = { card: Card, index: number };

export default class DurakGame {
  info: GameInfo;
  settings: GameSettings;
  players: Players;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  service!: GameService;
  round!: GameRound;

  constructor({ id, settings, users, adminAccname }: Lobby) {
    this.info = { id, adminAccname: adminAccname! };
    this.settings = settings;
    this.players = new Players(users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }

  start(socketsNamespace: GamesIO.NamespaceIO) {
    this.service = new GameService(socketsNamespace);
    this.makeFirstDistribution({ howMany: 1 });
    const attacker = this.makeInitialAttacker();
    this.makeDefender(attacker.left);
    const { desk, service } = this;
    this.round = new GameRound({ number: 1, attacker, desk, service });
  }

  get cardCountIncreasedFromLastDefense(): boolean {
    const lastCardCount = this.round.lastSuccesfullDefense?.deskCardCount;
    return lastCardCount ? this.desk.cardCount > lastCardCount : false;
  }

  insertCardOnDesk({ card, index, socket }: CardInfo & GameSocket) {
    this.desk.insertCard({ card, index });
    if (this.desk.getSlot({ index }).defendCard) {
      this.service.insertDefendCard({ card, index, socket });
    } else this.service.insertAttackCard({ card, index, socket });
  }

  removeFromHand({ player, socket, card }: { player: Player & CardRemove, card: Card } & GameSocket) {
    const { info: { accname } } = player;
    player.removeCard(card);
    this.service
      .removeCard({ accname, card, socket })
      .changeCardCount({ accname, socket, cardCount: player.hand.count });
  }

  clearDesk() {
    this.desk.clear();
    this.service.clearDesk();
  }

  handleBadDefense(): void {
    const defender = this.players.tryGetDefender();
    defender.receiveCards(...this.desk.cards);
    this.service.lostRound({ defender });
    this.clearDesk();
    return this.handleNewRound({ nextAttacker: defender.left });
  }

  handleSuccesfullDefense(): void {
    const defender = this.players.tryGetDefender();
    this.discard.push(...this.desk.cards);
    this.service.pushToDiscard().wonRound({ defender });
    this.clearDesk();
    return this.handleNewRound({ nextAttacker: defender });
  }

  handleNewRound({ nextAttacker }: { nextAttacker: Player }) {
    if (this.talon.isEmpty) this.deletePlayersWithEmptyHands();
    else this.makeCardDistribution();
    if (this.players.count === 1) this.end();
    const { attacker } = this.makeNewPlayers({ nextAttacker });
    const { desk, service, round: { number } } = this;
    this.round = new GameRound({ attacker, desk, service, number: number + 1 });
  }

  makeCardDistribution() {
    for (const player of this.round.distributionQueue) {
      if (this.talon.isEmpty) break;
      this.pushCardsFromTalon({ player });
    }
  }

  private pushCardsFromTalon({ player }: { player: Player }) {
    const cards = this.talon.popCards(player.missingNumberOfCards);
    player.receiveCards(...cards);
    this.service.pushFromTalon({ player, cards });
    if (this.talon.isEmpty) this.service.moveTrumpCard({ receiver: player });
  }

  restoreState({ accname, socket }: LobbyUserIdentifier & GameSocket): void {
    this.service.restoreState({ accname, socket, game: this });
  }

  private makeFirstDistribution({ howMany }: { howMany: number }) {
    const cardCountToDistribute = this.players.count * 6;
    const talonCards = this.talon.shuffle().popCards(cardCountToDistribute);
    this.players.receiveFirstCards({ talonCards, howMany });
  }

  makeAttacker(playerOrIdentifier: Player | LobbyUserIdentifier): Attacker {
    const attacker = this.make(Attacker, playerOrIdentifier);
    this.service.setAttackUI("revealed", attacker);
    return attacker;
  }

  makeDefender(playerOrIdentifier: Player | LobbyUserIdentifier): Defender {
    const defender = this.make(Defender, playerOrIdentifier);
    this.service.setDefendUI("revealed", defender);
    return defender;
  }

  makePlayer(playerOrIdentifier: Player | LobbyUserIdentifier): Player {
    const accname = this.getAccname(playerOrIdentifier);
    const superPlayer = this.players.tryGetPlayer({ accname }) as Attacker | Defender;
    this.service.setSuperPlayerUI("hidden", superPlayer);
    return this.make(Player, playerOrIdentifier);
  }

  private make<P extends Player>(
    PlayerLike: { new(player: Player): P },
    playerOrIdentifier: Player | LobbyUserIdentifier,
  ): P {
    const player = this.players.make(PlayerLike, playerOrIdentifier);
    const role = PlayerLike.name as PlayerRole;
    this.service.changeRoleTo(role, player);
    return player;
  }

  makeNewPlayers({ nextAttacker }: { nextAttacker: Player | LobbyUserIdentifier }) {
    this.makePlayer(this.players.tryGetAttacker());
    this.makePlayer(this.players.tryGetDefender());
    const attacker = this.makeAttacker(nextAttacker);
    const defender = this.makeDefender(attacker.left);
    return { attacker, defender };
  }

  makeNewAttacker({ nextAttacker }: { nextAttacker: Player | LobbyUserIdentifier }) {
    this.makePlayer(this.players.tryGetAttacker());
    return this.makeAttacker(nextAttacker);
  }

  private makeInitialAttacker(): Attacker {
    return this.makeAttacker({ accname: this.info.adminAccname });
  }

  private deletePlayersWithEmptyHands() {
    const newPlayers: Player[] = [];
    for (const player of this.players.__value) {
      if (player.hand.count === 0) {
        const { left, right } = player;
        left.right = player.right;
        right.left = player.left;
      } else {
        newPlayers.push(player);
      }
    }
    this.players.__value = newPlayers;
  }

  private end() {
    setTimeout(() => {
      durakGames.delete(this.info.id);
      // TODO SAVE GAME IN DATABASE
    }, 10_000);
  }

  private getAccname(playerOrIdentifier: Player | LobbyUserIdentifier) {
    return playerOrIdentifier instanceof Player
      ? playerOrIdentifier.info.accname
      : playerOrIdentifier.accname;
  }
}
