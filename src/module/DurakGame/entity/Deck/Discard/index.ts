import Deck from "@/module/DurakGame/entity/Deck/Deck.abstract.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import { type CanReceiveCards } from "@/module/DurakGame/DurakGame.js";
import type GameDiscardWebsocketService from "@/module/DurakGame/entity/Deck/Discard/Discard.service.js";

export default class Discard extends Deck implements CanReceiveCards {
  readonly #wsService: GameDiscardWebsocketService;

  constructor(wsService: GameDiscardWebsocketService) {
    super();
    this.#wsService = wsService;
  }

  receiveCards(...cards: Card[]): void {
    const hasBeenEmptyBeforeReceive = this.isEmpty;
    this.value.push(...cards);
    this.#wsService?.emitReceivedCards(this, cards, hasBeenEmptyBeforeReceive);
  }

  toJSON() {
    return {
      isEmpty: this.isEmpty,
    };
  }
}
