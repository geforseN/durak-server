import Card from "../entity/Card";
import { DeskSlot } from "./index";

export default class DefendedSlot extends DeskSlot {
  constructor(public attackCard: Card, public defendCard: Card) {
    super();
  }

  get value(): [Card, Card] {
    return [this.attackCard, this.defendCard];
  }

  ensureCanBeAttacked({ card: _card }: { card: Card }) {
    return Promise.reject(new Error("Слот полностью занят"));
  }

  ensureCanBeDefended({ card: _card }: { card: Card }) {
    return Promise.reject(new Error("Карта уже побита"));
  }

  ensureAllowsTransfer({ card }: { card: Card }) {
    const { rank } = card;
    return new Promise<Card>((resolve, reject) => {
      if (!this.attackCard.hasSame({ rank })) {
        reject("Нельзя перевести: нет схожего ранга");
      }
      resolve(card);
    });
  }
}