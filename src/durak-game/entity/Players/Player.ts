import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import Hand from "../Deck/Hand";
import Card from "../Card";
import { PlaceCardData } from "../../../namespaces/games/methods/handle-insert-card-on-desk";
import { GameSocket } from "../../../namespaces/games/games.service";

export type CardPlayerRole = "DEFENDER" | "ATTACKER" | "NONE"
export type CardPlayerStatus = "WAITING OPPONENT" | "WAITING ANOTHER ATTACKER" | "ATTACKING" | "DEFENDING" | "NONE";

export interface CardInsert {
  handleCardInsert({ game, card, slot, slotIndex, socket }: PlaceCardData & GameSocket): void | never;
}

export interface CardRemove {
  removeCard(card: Card): void;
}

export default class Player {
  info!: LobbyUser;
  hand!: Hand;
  status!: CardPlayerStatus;
  left!: Player;
  right!: Player;

  constructor(lobbyUser: LobbyUser | Player) {
    if (lobbyUser instanceof Player) {
      this.hand = lobbyUser.hand;
      this.status = lobbyUser.status;
      this.info = lobbyUser.info;
      this.left = lobbyUser.left;
      this.right = lobbyUser.right;
    } else this.initialize(lobbyUser);
  }

  receiveCards(...cardsToReceive: Card[]): void {
    this.hand.receiveCards(...cardsToReceive);
  }

  get missingCardNumber(): number {
    return 6 - this.hand.count;
  }

  private initialize(lobbyUser: LobbyUser) {
    this.info = lobbyUser;
    this.hand = new Hand();
    this.status = "NONE";
  }
}