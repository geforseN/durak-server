import Deck from "./Deck.abstract";
import Card from "../Card";
import { CanReceiveCards } from "../../DurakGame";
import GameDiscardService from "../Services/Discard.service";

export default class Discard extends Deck implements CanReceiveCards {
  service?: GameDiscardService;

  constructor() {
    super();
  }

  receiveCards(...cards: Card[]): void {
    this._value.push(...cards);
    this.service?.receiveCards(cards);
  }

  injectService(gameDeskService: GameDiscardService) {
    this.service = gameDeskService;
  }
}