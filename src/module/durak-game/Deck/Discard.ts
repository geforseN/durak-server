import Deck from "./Deck.abstract";
import Card from "../entity/Card";
import { CanReceiveCards } from "../DurakGame";
import GameDiscardService from "../Services/Discard.service";

export default class Discard extends Deck implements CanReceiveCards {
  service?: GameDiscardService;

  constructor() {
    super();
  }

  receiveCards(...cards: Card[]): void {
    const currentCardCount = this._value.length;
    this._value.push(...cards);
    const newCardCount = this._value.length;
    if (!currentCardCount && newCardCount) {
      this.service?.emitReceivedFirstCards();
    }
    this.service?.emitReceivedCards(cards);
  }

  injectService(gameDeskService: GameDiscardService) {
    this.service = gameDeskService;
  }
}