import { AllowedPlayerBadInputError } from "../../error/index.js";
import Card from "../Card/index.js";
import { DefendedSlot } from "./index.js";
import DeskSlot from "./DeskSlot.abstract.js";

export default class UnbeatenSlot extends DeskSlot {
  constructor(index: number, public attackCard: Card) {
    super(index);
  }

  get value() {
    return [this.attackCard];
  }

  override isUnbeaten(): this is UnbeatenSlot {
    return true;
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

  override nextDeskSlot(card: Card): DefendedSlot {
    return new DefendedSlot(this.index, this.attackCard, card);
  }
}
