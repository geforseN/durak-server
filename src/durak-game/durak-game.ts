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
import Attacker, { AttackerO } from "./entity/Players/Attacker";
import Defender, { DefenderO } from "./entity/Players/Defender";
import Player, { CardRemove } from "./entity/Players/Player";
import GameRound from "./GameRound";

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

  start(namespace: GamesIO.NamespaceIO) {
    this.service = new GameService(namespace);
    this.makeFirstDistribution({ howMany: 1 });
    const attacker = this.makeInitialAttacker();
    this.makeDefender(attacker.left);
    this.round = new GameRound({ number: 1, attacker });
    this.service.setAttackUI("revealed", attacker);
  }

  get cardCountIncreasedFromLastDefense(): boolean {
    const lastCardCount = this.round.lastSuccesfullDefense?.deskCardCount;
    return this.desk.cardCount > (lastCardCount ?? Number.NEGATIVE_INFINITY);
  }

  get cardCountSameFromLastDefense(): boolean {
    return this.desk.cardCount === this.round.lastSuccesfullDefense?.deskCardCount;
  }

  insertAttackCardOnDesk({ attacker, card, index, socket }: AttackerO & CardInfo & GameSocket): void {
    this.desk.insertAttackerCard({ index, card });
    this.service.insertAttackCard({ index, card, socket });
  }

  insertDefendCardOnDesk({ defender, card, index, socket }: DefenderO & CardInfo & GameSocket): void {
    this.desk.insertDefenderCard({ index, card });
    this.service.insertDefendCard({ index, card, socket });
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
    return this
      .lostRound({ defender })
      .handleNewRound({ nextAttacker: defender.left });
  }

  handleSuccesfullDefense(): void {
    const defender = this.players.tryGetDefender();
    return this
      .wonRound({ defender })
      .handleNewRound({ nextAttacker: defender });
  }

  handleNewRound({ nextAttacker }: { nextAttacker: Player }) {
    if (!this.talon.isEmpty) this.makeCardDistribution();
    const { attacker } = this.makeNewPlayers({ nextAttacker });
    this.round = new GameRound({ number: this.round.number + 1, attacker });
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
    this.players.receiveFirstCards({ talonCards, howMany });
  }

  makeAttacker(playerOrIdentifier: Player | LobbyUserIdentifier): Attacker {
    return this.make(playerOrIdentifier, Attacker);
  }

  makeDefender(playerOrIdentifier: Player | LobbyUserIdentifier): Defender {
    return this.make(playerOrIdentifier, Defender);
  }

  makePlayer(playerOrIdentifier: Player | LobbyUserIdentifier): Player {
    return this.make(playerOrIdentifier, Player);
  }

  private make<P extends Player>(
    playerOrIdentifier: Player | LobbyUserIdentifier, PlayerP: { new(player: Player): P },
  ): P {
    const p = this.players.make(playerOrIdentifier, PlayerP);
    this.service.changeRoleTo(PlayerP.name.toLowerCase() as PlayerRole, p);
    return p;
  }

  __makePLayer(playerOrIdentifier: Player | LobbyUserIdentifier) {
    this.make(playerOrIdentifier, Player);
  }

  makeNewPlayers({ nextAttacker }: { nextAttacker: Player }) {
    this.makePlayer(this.players.tryGetAttacker());
    this.makePlayer(this.players.tryGetDefender());
    const attacker = this.makeAttacker(nextAttacker);
    const defender = this.makeDefender(attacker.left);
    return { attacker, defender };
  }

  private getAccname(playerOrAccname: Player | string): string {
    return playerOrAccname instanceof Player ? playerOrAccname.info.accname : playerOrAccname;
  }

  private makeInitialAttacker(): Attacker {
    return this.makeAttacker({ accname: this.info.adminAccname });
  }

  get isOver() {
    return this.players.withCards.length === 1 && this.talon.isEmpty && this.desk.isEmpty;
  }
}
