import Deck from "../Deck.abstract.js";
import type Card from "../../Card/index.js";
import { type CanReceiveCards } from "../../../DurakGame.js";
import type GameDiscardWebsocketService from "./Discard.service.js";

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
