import { DurakGameSocket } from "../../../socket/DurakGameSocket.types";
import Card from "../../Card";

export default class GameDiscardService {
  constructor(private namespace: DurakGameSocket.Namespace) {
  }

  emitReceivedCards(cards: Card[]) {
    this.namespace.emit("discard__receiveCards", cards.length);
  }

  emitReceivedFirstCards() {
    this.namespace.emit("discard__setIsNotEmpty");
  }
}