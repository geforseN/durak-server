import Card from "../Card";
import { DeskSlot } from "./index";

export default class UnbeatenSlot extends DeskSlot {
  constructor(public attackCard: Card) {
    super();
  }

  get value() {
    return [this.attackCard];
  }

  assertAttack({ card: _card }: { card: Card }) {
    return Promise.reject("Слот занят");
  }

  assertDefense({ card }: { card: Card }) {
    return new Promise<Card>((resolve, reject) => {
      if (card.isTrump) resolve(card);
      if (this.attackCard.suit !== card.suit) reject("Вы кинули неверню масть");
      if (this.attackCard.power > card.power) reject("Вы кинули слабую карту");
      return resolve(card);
    });
  }

  allowsTransfer({ card }: { card: Card }) {
    const { rank } = card;
    return new Promise<Card>((resolve, reject) => {
      if (this.attackCard.hasSame({ rank })) resolve(card);
      reject("Нельзя перевести: нет схожего ранга");
    });
  }
}