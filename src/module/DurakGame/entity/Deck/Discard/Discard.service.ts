import type Discard from ".";
import { DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "../../Card";

export default class GameDiscardWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  emitReceivedCards(
    discard: Discard,
    cards: Card[],
    hasBeenEmptyBeforeReceive: boolean,
  ) {
    this.namespace.emit("discard::receivedCards", {
      addedCardsCount: cards.length,
      totalCardsCount: discard.count,
      isReceivedFirstCards: hasBeenEmptyBeforeReceive && !!cards.length,
    });
  }
}
