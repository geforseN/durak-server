import Deck from "../Deck.abstract";
import Card from "../../Card";
import { CanReceiveCards } from "../../../DurakGame.implimetntation";
import GameDiscardWebsocketService from "./Discard.service";

export default class Discard extends Deck implements CanReceiveCards {
  readonly #wsService: GameDiscardWebsocketService;

  constructor(wsService: GameDiscardWebsocketService) {
    super();
    this.#wsService = wsService;
  }

  receiveCards(...cards: Card[]): void {
    this.#receive(cards);
    this.#wsService?.emitReceivedCards(cards);
  }

  #receive(cards: Card[]) {
    const previousCardCount = this.value.length;
    const newCardCount = this.value.push(...cards);
    if (!previousCardCount && newCardCount) {
      this.#wsService.emitReceivedFirstCards();
    }
  }
}
