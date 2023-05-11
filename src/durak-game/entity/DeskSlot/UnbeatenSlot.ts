import Card from "../Card";
import { DeskSlot } from "./index";

export default class UnbeatenSlot extends DeskSlot {
  constructor(public attackCard: Card) {
    super();
  }

  get value() {
    return [this.attackCard];
  }

  assertCanBeAttacked({ card: _card }: { card: Card }) {
    return Promise.reject(new Error("Слот занят"));
  }

  assertCanBeDefended({ card }: { card: Card }) {
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

  allowsTransfer({ card }: { card: Card }) {
    return new Promise<Card>((resolve, reject) => {
      if (this.attackCard.hasSame({ rank: card.rank })) {
        resolve(card);
      } else reject("Нельзя перевести: нет схожего ранга");
    });
  }
}