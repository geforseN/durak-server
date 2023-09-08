import Card, { Rank } from "../Card/index.js";
import DefendedSlot from "./DefendedSlot.js";
import EmptySlot from "./EmptySlot.js";
import UnbeatenSlot from "./UnbeatenSlot.js";

export type DefendedDeskSlotBase = Required<
  Pick<DefendedSlot, "attackCard" | "defendCard">
>;

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;
  constructor(public index: number) {}

  isEmpty(): this is EmptySlot {
    return false;
  }

  isUnbeaten(): this is UnbeatenSlot {
    return false;
  }

  isDefended(): this is DefendedSlot {
    return false;
  }

  abstract nextDeskSlot(card: Card): DeskSlot

  abstract get value(): Card[];

  has({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  abstract ensureCanBeDefended(card: Card): Promise<Card | void>

  abstract ensureCanBeAttacked(card: Card): Promise<Card | void>

  async ensureAllowsTransfer(card: Card): Promise<Card | void> {
    if (!this.attackCard?.hasSame({ rank: card.rank })) {
      throw new Error("Нельзя перевести: нет схожего ранга");
    }
    return card;
  }
}
