import { GameLogicError, asNotificationAlert } from "../../error/index.js";
import Card from "../Card/index.js";
import { DeskSlot } from "./index.js";

export default class DefendedSlot extends DeskSlot {
  constructor(index: number, public attackCard: Card, public defendCard: Card) {
    super(index);
  }

  get value(): [Card, Card] {
    return [this.attackCard, this.defendCard];
  }

  override isDefended(): this is DefendedSlot {
    return true;
  }

  override async ensureCanBeAttacked() {
    throw new GameLogicError(
      "Cannot perform an attack because the slot is completely filled",
    );
  }

  override async ensureCanBeDefended() {
    throw new GameLogicError(
      "Cannot perform a defense because the slot is defended",
    );
  }

  override nextDeskSlot(_: Card): never {
    throw new GameLogicError(
      "The slot can not be used for a move because it is defended",
    );
  }
}
