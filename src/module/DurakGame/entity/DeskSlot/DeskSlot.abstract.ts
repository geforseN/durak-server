import { type default as Card, type Rank } from "../Card/index.js";
import type DefendedSlot from "./DefendedSlot.js";
import type EmptySlot from "./EmptySlot.js";
import type UnbeatenSlot from "./UnbeatenSlot.js";
import type UnbeatenTrumpSlot from "./UnbeatenTrumpSlot.js";

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

  isUnbeatenWithTrumpCard(): this is UnbeatenTrumpSlot {
    return false;
  }

  isDefended(): this is DefendedSlot {
    return false;
  }

  abstract nextDeskSlot(card: Card): DeskSlot | never;

  abstract get value(): Card[];

  has({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  abstract ensureCanBeDefended(card: Card): Promise<void>;

  abstract ensureCanBeAttacked(): Promise<void>;

  abstract ensureAllowsTransferMoveForRank(rank: Card["rank"]): Promise<void>;
}
