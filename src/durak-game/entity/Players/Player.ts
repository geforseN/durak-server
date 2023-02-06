import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import Hand from "../Deck/Hand";
import Card from "../Card";

export type CardPlayerRole =  "DEFENDER" | "ATTACKER" | "NONE"
export type CardPlayerStatus = "WAITING OPPONENT"| "WAITING ANOTHER ATTACKER" | "ATTACKING" | "DEFENDING" | "NONE";

export default class Player {
  info: LobbyUser;
  hand: Hand;
  status: CardPlayerStatus;
  left?: Player;
  right?: Player;

  constructor(lobbyUser: LobbyUser) {
    this.info = lobbyUser;
    this.hand = new Hand();
    this.status = "NONE";
  }

  receiveCards(...cardsToReceive: Card[]): void {
    this.hand.receiveCards(...cardsToReceive);
  }

  get missingCardNumber(): number {
    return 6 - this.hand.count;
  }
}