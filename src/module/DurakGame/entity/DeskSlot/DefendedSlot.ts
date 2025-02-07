import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import DeskSlot from "@/module/DurakGame/entity/DeskSlot/DeskSlot.abstract.js";

export default class DefendedSlot extends DeskSlot {
  constructor(
    index: number,
    public attackCard: Card,
    public defendCard: Card,
  ) {
    super(index);
  }

  override ensureAllowsTransferMove() {
    throw new AllowedPlayerBadInputError(
      "The transfer move is disallowed because defended slot exist on desk",
      { header: "Transfer move attempt" },
    );
  }

  override ensureCanBeAttacked() {
    throw new AllowedPlayerBadInputError(
      "Cannot perform an attack because the slot is completely filled",
      { header: "Attack move attempt" },
    );
  }

  override ensureCanBeDefended() {
    throw new AllowedPlayerBadInputError(
      "Cannot perform a defense because the slot is defended",
      { header: "Defense move attempt" },
    );
  }

  override isDefended(): this is DefendedSlot {
    return true;
  }

  override nextDeskSlot(_: Card): never {
    throw new AllowedPlayerBadInputError(
      "The slot can not be used for a move because it is defended",
      { header: "Move attempt" },
    );
  }

  get value(): [Card, Card] {
    return [this.attackCard, this.defendCard];
  }
}
