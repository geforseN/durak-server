import type DefendedSlot from "@/module/DurakGame/entity/DeskSlot/DefendedSlot.js";
import type EmptySlot from "@/module/DurakGame/entity/DeskSlot/EmptySlot.js";
import type UnbeatenSlot from "@/module/DurakGame/entity/DeskSlot/UnbeatenSlot.js";
import type UnbeatenTrumpSlot from "@/module/DurakGame/entity/DeskSlot/UnbeatenTrumpSlot.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type { Rank } from "@durak-game/durak-dts";

export type DefendedDeskSlotBase = Required<
  Pick<DefendedSlot, "attackCard" | "defendCard">
>;

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;

  constructor(readonly index: number) {}

  hasCardWith({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.rank.isEqualTo(rank));
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

  abstract ensureAllowsTransferMove(card: Card): void | never;

  abstract ensureCanBeAttacked(): void;

  abstract ensureCanBeDefended(_card: Card): void;

  abstract nextDeskSlot(_card: Card): DeskSlot | never;

  abstract get value(): Card[];

  get cards() {
    return this.value;
  }

  toJSON() {
    return {
      attackCard: this.attackCard?.toJSON?.(),
      defendCard: this.defendCard?.toJSON?.(),
      index: this.index,
    };
  }
}
