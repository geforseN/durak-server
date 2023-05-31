import Card from "../Card";
import { DeskSlot } from "./index";

export default class UnbeatenSlot extends DeskSlot {
  constructor(public attackCard: Card) {
    super();
  }

  get value() {
    return [this.attackCard];
  }

  override ensureCanBeAttacked() {
    return Promise.reject(new Error("Слот занят"));
  }

  override ensureCanBeDefended({ card }: { card: Card }) {
    return new Promise<Card>((resolve, reject) => {
      if (card.isTrump) resolve(card);
      if (this.attackCard.suit !== card.suit) {
        reject(new Error("Вы кинули неверную масть"));
      }
      if (this.attackCard.power > card.power) {
        reject(new Error("Вы кинули слабую карту"));
      }
      resolve(card);
    });
  }
}