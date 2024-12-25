import type { AllowedMissingCardCount } from "@durak-game/durak-dts";

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

export default class Desk {
  constructor(
    public _slots: DeskSlots,
    readonly allowedFilledSlotCount: AllowedMissingCardCount,
  ) {}

  static clean(size: number) {
    return new Desk(DeskSlots.clean(size), 0);
  }

  withSameSettings() {
    return new Desk(this._slots, this.allowedFilledSlotCount);
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
    assert.ok([...this.ranks].length !== 0, "The desk is empty");
    assert.ok([...this.ranks].length === 1, "The desk has more than one rank");
  }

  provideCards<Target extends Defender | Discard>(target: Target) {
    target = target.withAdded(...this._slots.cards);
    this._slots = this._slots.asClean();
  }

  slotAt(index: number) {
    return (
      this._slots.at(index) || raise(`Slot with index=${index} does not exist`)
    );
  }

  toJSON() {
    return {
      slots: this._slots.toJSON(),
    };
  }

  update(slot: DeskSlot, card: Card) {
    this._slots.update(slot, card);
  }

  with(slot: DeskSlot, card: Card) {
    return new Desk(this._slots.with(slot, card), this.allowedFilledSlotCount);
  }

  get allowsAttackerMove(): boolean {
    return this.isAllowsMoves;
  }

  get cards() {
    return {
      count: this._slots.cards.length,
    };
  }

  get defendedSlots() {
    return new DefendedSlots([...this]);
  }

  get filledSlots() {
    return new FilledSlots([...this]);
  }

  get isAllowsMoves() {
    return this.allowedFilledSlotCount > this.filledSlots.count;
  }

  get isDefended(): boolean {
    return this.defendedSlots.count === this.filledSlots.count;
  }

  get isEmpty(): boolean {
    return this._slots.isEverySlotEmpty;
  }

  get randomEmptySlot() {
    return this._slots.randomEmptySlot;
  }

  get ranks() {
    return new Set(this._slots.cards.map((card) => card.rank));
  }

  get shouldDefenderMove(): boolean {
    return this.isAllowsMoves;
  }

  get unbeatenSlots() {
    return new UnbeatenSlots([...this]);
  }
}
