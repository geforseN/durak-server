import Card from "../Card";
import { DeskSlot } from "./index";

export default class DefendedSlot extends DeskSlot {
  constructor(public attackCard: Card, public defendCard: Card) {
    super();
  }

  get value(): [Card, Card] {
    return [this.attackCard, this.defendCard];
  }

  override ensureCanBeAttacked() {
    return Promise.reject(new Error("Слот полностью занят"));
  }

  override ensureCanBeDefended() {
    return Promise.reject(new Error("Карта уже побита"));
  }
}