import Deck from "../Deck.abstract";
import type Card from "../../Card";
import { type CanReceiveCards } from "../../../DurakGame";
import type GameDiscardWebsocketService from "./Discard.service";

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
}
