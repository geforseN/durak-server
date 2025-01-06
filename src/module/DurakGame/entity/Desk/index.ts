import assert from "node:assert";

import type Card from "@/module/DurakGame/entity/Card/index.js";
import type { Defender } from "@/module/DurakGame/entity/Player/Defender.js";

import raise from "@/common/raise.js";
import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import { type Discard } from "@/module/DurakGame/entity/Deck/index.js";
import { DeskSlot } from "@/module/DurakGame/entity/DeskSlot/index.js";
import {
  DefendedSlots,
  FilledSlots,
  UnbeatenSlots,
} from "@/module/DurakGame/entity/DeskSlots/Slots.js";
import DeskSlots from "@/module/DurakGame/entity/DeskSlots/index.js";
import type { Rank } from "@durak-game/durak-dts";

class Ranks {
  #lazy_values?: Set<Rank>;

  constructor(readonly desk: Desk) {}

  get #values() {
    if (!this.#lazy_values) {
      this.#lazy_values = new Set(this.desk.cards.map((card) => card.rank));
    }
    return this.#lazy_values
  }

  get count() {
    return this.#values.size;
  }
}

export default class Desk {
  ranks: Ranks;

  constructor(private readonly _slots: DeskSlots) {
    this.ranks = new Ranks(this);
    this.cards = [
      /* TODO



  get cards() {
    return {
      count: this._slots.cards.length,
    };
  }

      */
    ];
    this.slots.unbeaten = new UnbeatenSlots(this._slots);
    this.slots.defended = new DefendedSlots(this._slots);
    this.slots.filled = new FilledSlots(this._slots);
  }

  static clean(size: number) {
    return new Desk(DeskSlots.clean(size));
  }

  withSameSettings() {
    return new Desk(this._slots);
  }

  ensureAllowsTransferMove(card: Card) {
    return this._slots.ensureAllowsTransferMove(card);
  }

  ensureIncludesRank(rank: Card["rank"]): void {
    if (this._slots.someSlotHasSameRank(rank)) {
      return;
    }
    throw new AllowedPlayerBadInputError("Нет схожего ранга на доске");
  }

  ensureOnlyHasRank(rank: Card["rank"]) {
    this.ensureIncludesRank(rank);
    assert.ok(this.ranks.count !== 0, "The desk is empty");
    assert.ok(this.ranks.count === 1, "The desk has more than one rank");
  }

  provideCards<Target extends Defender | Discard>(target: Target) {
    target = target.withAdded(...this._slots.cards);
    this._slots = this._slots.asClean();
  }

  toJSON() {
    return {
      slots: this.slots.toJSON(),
    };
  }

  with(slot: DeskSlot, card: Card) {
    return new Desk(this._slots.with(slot, card));
  }

  isAllowsMoves() {
    return this.slots.all.count > this.slots.filled.count;
  }

  isDefended(): boolean {
    return this.slots.defended.count === this.slots.filled.count;
  }

  isEmpty(): boolean {
    return this.slots.all.count === this.slots.empty.count;
  }
}

export class CleanDesk extends Desk {
  constructor(size: number) {
    super(DeskSlots.clean(size));
  }
}

type Some = 1

type Every = 1

class EmptyDesk {
  slots: {
    empty: Every
    filled: undefined
    defended: undefined
    unbeaten: undefined
  }
}

class DefendedDesk {
  slots: {
    empty: Some;
    filled: Some;
    defended: Some;
    unbeaten: undefined;
  };
}

class UnbeatenDesk {
  slots: {
    empty: Some;
    filled: undefined;
    defended: Some;
    unbeaten: Some;
  };
}
