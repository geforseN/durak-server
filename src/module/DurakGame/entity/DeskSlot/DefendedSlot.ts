import Card from "../Card";
import { DeskSlot } from "./index";

export default class DefendedSlot extends DeskSlot {
  constructor(public attackCard: Card, public defendCard: Card) {
    super();
  }

  get value(): [Card, Card] {
    return [this.attackCard, this.defendCard];
  }

  override isDefended(): this is DefendedSlot {
    return true;
  }

  override async ensureCanBeAttacked() {
    throw new Error("Слот полностью занят");
  }

  override async ensureCanBeDefended() {
    throw new Error("Карта уже побита");
  }

  override nextDeskSlot(_card: Card): DeskSlot | never {
    throw new Error("Can not update slot, slot is defended");
  }
}
