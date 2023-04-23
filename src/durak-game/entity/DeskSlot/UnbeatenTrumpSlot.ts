import Card from "../Card";
import { UnbeatenSlot } from "./index";

export default class UnbeatenTrumpSlot extends UnbeatenSlot {
  constructor(public attackCard: Card) {
    super(attackCard);
  }

  assertCanBeDefended({ card }: { card: Card }) {
    return new Promise<Card>((resolve, reject) => {
      if (!card.isTrump) reject("Козырную карту можно побить только козырной");
      if (this.attackCard.power > card.power) reject("Вы кинули слабую карту");
      resolve(card);
    });
  }
}