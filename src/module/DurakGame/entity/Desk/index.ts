import type { AllowedMissingCardCount } from "@durak-game/durak-dts";

import assert from "node:assert";

import type Card from "@/module/DurakGame/entity/Card/index.js";
import type { Defender } from "@/module/DurakGame/entity/Player/Defender.js";

import raise from "@/common/raise.js";
import { type CanProvideCards } from "@/module/DurakGame/DurakGame.js";
import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import { type Discard } from "@/module/DurakGame/entity/Deck/index.js";
import { DeskSlot } from "@/module/DurakGame/entity/DeskSlot/index.js";
import {
  DefendedSlots,
  FilledSlots,
  UnbeatenSlots,
} from "@/module/DurakGame/entity/DeskSlots/Slots.js";
import DeskSlots from "@/module/DurakGame/entity/DeskSlots/index.js";

export default class Desk implements CanProvideCards<Defender | Discard> {
  _slots: Readonly<DeskSlots>;
  readonly allowedFilledSlotCount: number;
  constructor(settings: {
    allowedFilledSlotCount: AllowedMissingCardCount;
    slotCount: AllowedMissingCardCount;
  }) {
    this.allowedFilledSlotCount = settings.allowedFilledSlotCount;
    this._slots = new DeskSlots(settings.slotCount);
  }

  *[Symbol.iterator]() {
    yield* this._slots;
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

  getValidSlot(slotData: unknown) {
    if (slotData instanceof DeskSlot) {
      return this.slotAt(slotData.index);
    }
    assert.ok(DeskSlot.isSlotIndexLike(slotData));
    return this.slotAt(slotData);
  }

  provideCards<Target extends Defender | Discard>(target: Target) {
    target.receiveCards(...this._slots.cards);
    this._slots = this._slots.toEmpty();
  }

  slotAt(index: number) {
    return (
      this._slots.at(index) || raise(`Slot with index=${index} does not exist`)
    );
  }

  toJSON(): {
    slots: DeskSlot[];
  } {
    return { slots: [...this._slots] };
  }

  update(slot: DeskSlot, card: Card) {
    this._slots.update(slot, card);
  }

  get allowsAttackerMove(): boolean {
    return this.isAllowsMoves;
  }

  get cardsCount() {
    return this._slots.cardsCount;
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
