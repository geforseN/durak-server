import assert from "node:assert";

import type DefendedSlot from "@/module/DurakGame/entity/DeskSlot/DefendedSlot.js";
import type EmptySlot from "@/module/DurakGame/entity/DeskSlot/EmptySlot.js";
import type UnbeatenSlot from "@/module/DurakGame/entity/DeskSlot/UnbeatenSlot.js";
import type UnbeatenTrumpSlot from "@/module/DurakGame/entity/DeskSlot/UnbeatenTrumpSlot.js";

import { type default as Card } from "@/module/DurakGame/entity/Card/index.js";

export type DefendedDeskSlotBase = Required<
  Pick<DefendedSlot, "attackCard" | "defendCard">
>;

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  static getValidDeskSlot(
    slotData: unknown,
    getDeskSlot: (_slotIndex: number) => DeskSlot | never,
  ) {
    const slot =
      slotData instanceof DeskSlot
        ? slotData
        : DeskSlot.isSlotIndexLike(slotData) && getDeskSlot(slotData);
    assert.ok(slot);
    return slot;
  }

  static isSlotIndexLike(index: unknown): index is number {
    return typeof index === "number";
  }

  hasCardWith({ rank }: { rank: Card["rank"] }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  isDefended(): this is DefendedSlot {
    return false;
  }

  isEmpty(): this is EmptySlot {
    return false;
  }

  isUnbeaten(): this is UnbeatenSlot {
    return false;
  }

  isUnbeatenWithTrumpCard(): this is UnbeatenTrumpSlot {
    return false;
  }

  abstract ensureAllowsTransferMoveForRank(_rank: Card["rank"]): Promise<void>;

  abstract ensureCanBeAttacked(): Promise<void>;

  abstract ensureCanBeDefended(_card: Card): Promise<void>;

  abstract nextDeskSlot(_card: Card): DeskSlot | never;

  abstract get value(): Card[];
}
