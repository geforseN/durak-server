import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import Hand from "../Deck/Hand";
import Card from "../Card";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-put-card-on-desk";
import { GameSocket } from "../../../namespaces/games/game.service";
import DurakGame from "../../DurakGame";

export interface CardPut {
  putCardOnDesk({ game, card, slotIndex, socket }: PlaceCardData & GameSocket): void | never;
}

export interface CardRemove {
  removeCard(card: Card): void | never;
}

export interface MoveStop {
  stopMove({ game }: { game: DurakGame }): void | never;
}

export default class Player {
  info!: LobbyUser;
  hand!: Hand;
  left!: Player;
  right!: Player;
  index!: number;

  constructor(param: LobbyUser | Player) {
    if (param instanceof Player) {
      this.initializeFromPlayer(param);
    } else this.initializeFromLobbyUser(param);
  }

  receiveCards(...cardsToReceive: Card[]): void {
    this.hand.receive(...cardsToReceive);
  }

  get id(): string {
    return this.info.accname;
  }

  /** @return integer from 0 to 6 */
  get missingNumberOfCards(): number {
    return Math.max(6 - this.hand.count, 0);
  }

  private initializeFromLobbyUser(lobbyUser: LobbyUser) {
    this.info = lobbyUser;
    this.hand = new Hand();
  }

  private initializeFromPlayer(player: Player) {
    this.hand = player.hand;
    this.info = player.info;
    this.left = player.left;
    this.right = player.right;
    this.index = player.index;
  }

  canTakeMore({ cardCount }: { cardCount: number }) {
    return this.hand.count > cardCount;
  }

  isPrimalAttacker({ game: { round: { primalAttacker } } }: { game: DurakGame }) {
    return this.info.accname === primalAttacker?.info.accname;
  }
}
