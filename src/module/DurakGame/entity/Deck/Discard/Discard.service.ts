import type Discard from ".";
import { type DurakGameSocket } from "../../../socket/DurakGameSocket.types";
import type Card from "../../Card";

export default class GameDiscardWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  emitReceivedCards(discard: Discard, cards: Card[]) {
    this.namespace.emit("discard::receivedCards", {
      addedCardsCount: cards.length,
      totalCardsCount: discard.count,
    });
  }

  emitReceivedFirstCards() {
    this.namespace.emit("discard::becameFilled");
  }
}
