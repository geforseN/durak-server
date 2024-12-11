import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import DeskSlot from "@/module/DurakGame/entity/DeskSlot/DeskSlot.abstract.js";
import { DefendedSlot } from "@/module/DurakGame/entity/DeskSlot/index.js";

export default class UnbeatenSlot extends DeskSlot {
  constructor(index: number, public attackCard: Card) {
    super(index);
  }

  override async ensureAllowsTransferMoveForRank(
    rank: Card["rank"],
  ): Promise<void> {
    if (this.attackCard.hasSame({ rank })) {
      return;
    }
    throw new AllowedPlayerBadInputError(
      `The card you threw has wrong rank, allowed rank is ${rank}`,
      {
        header: "Transfer move attempt",
      },
    );
  }

  override async ensureCanBeAttacked() {
    throw new AllowedPlayerBadInputError("The slot already attacked", {
      header: "Attack move attempt",
    });
  }

  override async ensureCanBeDefended(card: Card) {
    if (card.isTrump) {
      return;
    }
    if (this.attackCard.suit !== card.suit) {
      throw new AllowedPlayerBadInputError(
        "The card you threw is of the wrong suit",
        { header: "Defense move attempt" },
      );
    }
    if (this.attackCard.power > card.power) {
      throw new AllowedPlayerBadInputError("The card you threw is weaker", {
        header: "Defense move attempt",
      });
    }
  }

  override isUnbeaten(): this is UnbeatenSlot {
    return true;
  }

  override nextDeskSlot(card: Card): DefendedSlot {
    return new DefendedSlot(this.index, this.attackCard, card);
  }

  get value() {
    return [this.attackCard];
  }
}
