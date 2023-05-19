import Deck from "../Deck.abstract";
import Card from "../../Card";
import { CanReceiveCards } from "../../../DurakGame.implimetntation";
import GameDiscardService from "./Discard.service";

export default class Discard extends Deck implements CanReceiveCards {
  #service?: GameDiscardService;

  constructor() {
    super();
  }

  receiveCards(...cards: Card[]): void {
    this.#receive(cards);
    this.#service?.emitReceivedCards(cards);
  }

  #receive(cards: Card[]) {
    const previousCardCount = this._value.length;
    const newCardCount = this._value.push(...cards);
    if (!previousCardCount && newCardCount) {
      this.#service?.emitReceivedFirstCards();
    }
  }

  injectService(gameDeskService: GameDiscardService) {
    this.#service = gameDeskService;
  }
}