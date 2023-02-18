import { GameSettings } from "../namespaces/lobbies/lobbies.types";
import Lobby from "../namespaces/lobbies/entity/lobby";
import Players from "./entity/Players/Players";
import Discard from "./entity/Deck/Discard";
import Talon from "./entity/Deck/Talon";
import Desk from "./entity/Desk";
import { LobbyUserIdentifier } from "../namespaces/lobbies/entity/lobby-users";
import { GameSocket, GameService } from "../namespaces/games/game.service";
import { GamesIO } from "../namespaces/games/games.types";
import Card from "./entity/Card";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";
import Player, { CardRemove } from "./entity/Players/Player";
import GameRound from "./GameRound";

export type GameInfo = { id: string, adminAccname: string };

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

  start(namespace: GamesIO.NamespaceIO) {
    this.service = new GameService(namespace);
    this.makeFirstDistribution({ howMany: 1 });
    const attacker = this.makeInitialAttacker();
    const defender = this.makeDefender(attacker.left);
    this.round = new GameRound(1, { attacker, defender });
    this.service.setAttackUI("revealed", attacker);
  }

  get cardCountIncreasedFromLastDefense(): boolean {
    const lastCardCount = this.round.lastSuccesfullDefense?.cardCount;
    return this.desk.cardCount > (lastCardCount ?? Number.NEGATIVE_INFINITY);
  }

  get cardCountSameFromLastDefense(): boolean {
    return this.desk.cardCount === this.round.lastSuccesfullDefense?.cardCount;
  }

  insertAttackCardOnDesk({ card, index, socket }: { card: Card, index: number } & GameSocket): void {
    this.desk.insertAttackerCard({ index, card });
    this.service.insertAttackCard({ index, card, socket });
  }

  insertDefendCardOnDesk({ card, index, socket }: { card: Card, index: number } & GameSocket): void {
    this.desk.insertDefenderCard({ index, card });
    this.service.insertDefendCard({ index, card, socket });
  }

  removeCard({ player, socket, card }: { player: Player & CardRemove, card: Card } & GameSocket) {
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

  handleBadDefense({ defender }: { defender: Defender }): void {
    return this.lostRound({ defender }).handleNewRound({ nextAttacker: defender.left });
  }

  handleSuccesfullDefense({ defender }: { defender: Defender }): void {
    return this.wonRound({ defender }).handleNewRound({ nextAttacker: defender });
  }

  handleNewRound({ nextAttacker }: { nextAttacker: Player }) {
    if (!this.talon.isEmpty) this.makeCardDistribution();
    const { attacker, defender } = this.makeNewPlayers({ nextAttacker });
    this.round = new GameRound(this.round.number + 1, { attacker, defender });
    this.service.setAttackUI("revealed", attacker);
  }

  makeCardDistribution() {
    for (const player of this.round.distributionQueue.value) {
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

  private lostRound({ defender }: { defender: Defender }): this {
    defender.receiveCards(...this.desk.cards);
    this.service.lostRound({ defender });
    this.clearDesk();
    return this;
  }

  private wonRound({ defender }: { defender: Defender }): this {
    this.discard.push(...this.desk.cards);
    this.service.wonRound({ defender });
    this.clearDesk();
    return this;
  }

  restoreState({ accname, socket }: LobbyUserIdentifier & GameSocket): void {
    this.service.restoreState({ accname, socket, game: this });
  }

  private makeFirstDistribution({ howMany }: { howMany: number }) {
    const cardCountToDistribute = this.players.count * 6;
    const talonCards = this.talon.shuffle().popCards(cardCountToDistribute);
    this.players.receiveCards({ talonCards, howMany });
  }

  private makeInitialAttacker(): Attacker {
    return this.makeAttacker({ accname: this.info.adminAccname });
  }

  makeAttacker(playerOrIdentifier: Player | LobbyUserIdentifier): Attacker {
    const attacker = this.players.makeAttacker(playerOrIdentifier);
    this.service.changeRoleTo("attacker", attacker);
    return attacker;
  }

  makeDefender(playerOrIdentifier: Player | LobbyUserIdentifier): Attacker {
    const defender = this.players.makeDefender(playerOrIdentifier);
    this.service.changeRoleTo("defender", defender);
    return defender;
  }

  makePlayer(playerOrIdentifier: Player | LobbyUserIdentifier): Player {
    const player = this.players.makePlayer(playerOrIdentifier);
    this.service.changeRoleTo("player", player);
    return player;
  }

  get isOver() {
    return this.players.withCards.length === 1;
  }

  letMoveTo(playerOrAccname: Player | string) {
    const accname = this.getAccname(playerOrAccname);
    this.round.__letMoveTo(accname);
    this.service.letMoveTo(accname);
  }

  private getAccname(playerOrAccname: Player | string): string {
    return playerOrAccname instanceof Player ? playerOrAccname.info.accname : playerOrAccname;
  }

  private makeNewPlayers({ nextAttacker }: { nextAttacker: Player }) {
    this.makePlayer(this.players.tryGetAttacker());
    this.makePlayer(this.players.tryGetDefender());
    const attacker = this.makeAttacker(nextAttacker);
    const defender = this.makeDefender(attacker.left);
    return { attacker, defender };
  }
}
