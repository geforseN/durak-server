import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import Hand from "./Deck/Hand";
import Card from "./card";

export type CardPlayerRole =  "DEFENDER" | "ATTACKER" | "NONE"
export type CardPlayerStatus = "WAITING OPPONENT"| "WAITING ANOTHER ATTACKER" | "ATTACKING" | "DEFENDING" | "NONE";

export default class CardPlayer {
  info: LobbyUser;
  hand: Hand;
  status: CardPlayerStatus;
  role: CardPlayerRole;
  left?: CardPlayer;
  right?: CardPlayer;

  constructor(lobbyUser: LobbyUser) {
    this.info = lobbyUser;
    this.hand = new Hand();
    this.status = "NONE";
    this.role = "NONE";
  }

  receiveCards(...cardsToReceive: Card[]): void {
    this.hand.receiveCards(...cardsToReceive);
  }

  makeDefender(): this {
    this.role = "DEFENDER";
    return this;
  }

  makeAttacker(): this {
    this.role = "ATTACKER";
    return this;
  }

  get missingCardNumber(): number {
    return 6 - this.hand.count;
  }
}