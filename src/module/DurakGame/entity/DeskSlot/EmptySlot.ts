import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import DeskSlot from "@/module/DurakGame/entity/DeskSlot/DeskSlot.abstract.js";
import { UnbeatenSlot, UnbeatenTrumpSlot } from "@/module/DurakGame/entity/DeskSlot/index.js";

export default class EmptySlot extends DeskSlot {
  override async ensureAllowsTransferMoveForRank(_: Card["rank"]) {
    return;
  }

  override async ensureCanBeAttacked() {
    return;
  }

  override async ensureCanBeDefended() {
    throw new AllowedPlayerBadInputError("Empty slot can not be defended", {
      header: "Defense move attempt",
    });
  }

  override isEmpty(): this is EmptySlot {
    return true;
  }

  override nextDeskSlot(card: Card): UnbeatenSlot | UnbeatenTrumpSlot {
    return card.isTrump
      ? new UnbeatenTrumpSlot(this.index, card)
      : new UnbeatenSlot(this.index, card);
  }

  get value(): [] {
    return [];
  }
}
