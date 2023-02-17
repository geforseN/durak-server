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
    this.round = new GameRound({ attacker, defender });
    this.service.setAttackUI("revealed", attacker);
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
    this.lostRound({ defender });
    return this.handleNewTurn({ nextAttacker: defender.left });
  }

  handleSuccesfullDefense({ defender }: { defender: Defender }): void {
    this.wonRound({ defender });
    return this.handleNewTurn({ nextAttacker: defender });
  }

  handleNewTurn({ nextAttacker }: { nextAttacker: Player }) {
    this.makeCardDistribution();
    const attacker = this.makeAttacker(nextAttacker);
    const defender = this.makeDefender(attacker.left);
    this.round.nextRound({ attacker, defender });
    this.service.setAttackUI("revealed", attacker);
  }

  makeCardDistribution() {
    for (const accname of this.round.distributionAccnameQueue) {
      if (this.talon.isEmpty) break;
      const player = this.players.tryGetPlayer({ accname });
      this.pushCardsFromTalon({ player });
    }
  }

  private pushCardsFromTalon({ player }: { player: Player }) {
    const cards = this.talon.popCards(player.missingNumberOfCards);
    player.receiveCards(...cards);
    this.service.pushFromTalon({ player, cards });
    if (this.talon.isEmpty) this.service.moveTrumpCard({ receiver: player });
  }

  private lostRound({ defender }: { defender: Defender }) {
    defender.receiveCards(...this.desk.cards);
    this.service.lostRound({ defender });
    this.clearDesk();
  }

  private wonRound({ defender }: { defender: Defender }) {
    this.discard.push(...this.desk.cards);
    this.service.wonRound({ defender });
    this.clearDesk();
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

  get isOver() {
    return this.players.__value.filter((player) => player.hand.count !== 0).length === 1;
  }
}
