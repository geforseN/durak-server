import Card from "../Card";
import { UnbeatenSlot } from "./index";

export default class UnbeatenTrumpSlot extends UnbeatenSlot {
  constructor(public attackCard: Card) {
    super(attackCard);
  }

  override ensureCanBeDefended({ card }: { card: Card }) {
    return new Promise<Card>((resolve, reject) => {
      if (!card.isTrump) {
        reject(new Error("Козырную карту можно побить только козырной"));
      }
      if (this.attackCard.power > card.power) {
        reject(new Error("Вы кинули слабую карту"));
      }
      resolve(card);
    });
  }
}