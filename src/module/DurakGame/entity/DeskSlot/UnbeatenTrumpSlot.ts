import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import UnbeatenSlot from "@/module/DurakGame/entity/DeskSlot/UnbeatenSlot.js";

export default class UnbeatenTrumpSlot extends UnbeatenSlot {
  constructor(index: number, public attackCard: Card) {
    super(index, attackCard);
  }

  override isUnbeatenWithTrumpCard(): this is UnbeatenTrumpSlot {
    return true;
  }

  override async ensureCanBeDefended(card: Card) {
    if (!card.isTrump) {
      throw new AllowedPlayerBadInputError(
        "A trump card can only be beaten with a trump card",
        { header: "Defense move attempt" },
      );
    }
    if (this.attackCard.power > card.power) {
      throw new AllowedPlayerBadInputError("The card you threw is weaker", {
        header: "Defense move attempt",
      });
    }
    return;
  }
}
