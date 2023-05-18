import Card from "../entity/Card";
import { DeskSlot } from "./index";

export default class DefendedSlot extends DeskSlot {
  constructor(public attackCard: Card, public defendCard: Card) {
    super();
  }

  get value(): [Card, Card] {
    return [this.attackCard, this.defendCard];
  }

  override ensureCanBeAttacked({ card: _card }: { card: Card }) {
    return Promise.reject(new Error("Слот полностью занят"));
  }

  override ensureCanBeDefended({ card: _card }: { card: Card }) {
    return Promise.reject(new Error("Карта уже побита"));
  }

  override ensureAllowsTransfer({ card }: { card: Card }) {
    return new Promise<Card>((resolve, reject) => {
      if (!this.attackCard.hasSame({ rank: card.rank })) {
        reject(new Error("Нельзя перевести: нет схожего ранга"));
      }
      resolve(card);
    });
  }
}