import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import Hand from "./Deck/Hand";
import Card from "./card";

export default class CardPlayer {
  // { accname, nickname, connectStatus, personalLink, photoUrl }
  info: LobbyUser & { isConnected: boolean };
  hand: Hand;
  left?: CardPlayer;
  right?: CardPlayer;

  constructor(lobbyUser: LobbyUser) {
    this.info = { ...lobbyUser, isConnected: false };
    this.hand = new Hand();
  }

  receiveCards(...cardsToReceive: Card[]): void {
    this.hand.receiveCards(...cardsToReceive);
  }
}