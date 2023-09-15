import { AllowedPlayerBadInputError } from "../../error/index.js";
import Card from "../Card/index.js";
import { UnbeatenSlot, UnbeatenTrumpSlot } from "./index.js";
import DeskSlot from "./DeskSlot.abstract.js";

export default class EmptySlot extends DeskSlot {
  get value(): [] {
    return [];
  }

  override isEmpty(): this is EmptySlot {
    return true;
  }

  override async ensureCanBeAttacked() {
    return;
  }

  override async ensureCanBeDefended() {
    throw new AllowedPlayerBadInputError("Empty slot can not be defended", {
      header: "Defense move attempt",
    });
  }

  override async ensureAllowsTransferMoveForRank(_: Card["rank"]) {
    return;
  }

  override nextDeskSlot(card: Card): UnbeatenSlot | UnbeatenTrumpSlot {
    return card.isTrump
      ? new UnbeatenTrumpSlot(this.index, card)
      : new UnbeatenSlot(this.index, card);
  }
}
