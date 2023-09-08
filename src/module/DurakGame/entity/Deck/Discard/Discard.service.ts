import type Discard from "./index.js";
import { DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "../../Card/index.js";

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
