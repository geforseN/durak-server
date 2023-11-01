import Card from "../Card";
import DefendedSlot from "./DefendedSlot";
import DeskSlot from "./DeskSlot.abstract";
import EmptySlot from "./EmptySlot";
import UnbeatenSlot from "./UnbeatenSlot";
import UnbeatenTrumpSlot from "./UnbeatenTrumpSlot";

export default class NextDeskSlot {
  constructor(private slot: DeskSlot, private card: Card) {}

  get correctSlot() {
    if (this.slot instanceof EmptySlot) {
      return this.card.isTrump
        ? new UnbeatenTrumpSlot(this.card)
        : new UnbeatenSlot(this.card);
    }
    if (this.slot instanceof UnbeatenSlot) {
      return new DefendedSlot(this.slot.attackCard, this.card);
    }
    throw new Error("Can not update slot");
  }
}
