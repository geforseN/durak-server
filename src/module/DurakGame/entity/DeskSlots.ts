import { DefendedSlot, DeskSlot, EmptySlot, UnbeatenSlot } from "./DeskSlot";
import Card, { Rank } from "./Card";
import { randomInt } from "node:crypto";
import { raise } from "../../..";

export default class DeskSlots {
  readonly #value: DeskSlot[];

  constructor(length: number) {
    this.#value = Array.from({ length }, () => new EmptySlot());
  }

  get isEverySlotEmpty(): boolean {
    return this.#value.every((slot) => slot instanceof EmptySlot);
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  get count() {
    return this.#value.length;
  }

  get cards(): Card[] {
    return this.#value.flatMap((slot) => slot.value);
  }

  get cardsCount(): number {
    return this.cards.length;
  }

  updateSlot({ at: index, with: card }: { at: number; with: Card }) {
    this.#value[index] = this.#value[index].nextDeskSlot(card);
  }

  async allowsTransferMove(card: Card, slotIndex: number): Promise<boolean> {
    if (!this.at(slotIndex).isEmpty()) {
      return Promise.reject(false);
    }
    return Promise.all(
      this.#value.map((slot) => slot.ensureAllowsTransfer(card)),
    ).then(
      (_cards) => true,
      (_error) => false,
    );
  }

  at(index: number): DeskSlot {
    return this.#value.at(index) || raise();
  }

  someSlotHas({ rank }: { rank: Rank }) {
    return this.#value.some((slot) => slot.has({ rank }));
  }

  get randomEmptySlotIndex(): number {
    const emptySlotsIndexes = this.#value.reduce(
      (indexesOfEmptySlots: number[], slot, index) => {
        if (slot instanceof EmptySlot) {
          indexesOfEmptySlots.push(index);
        }
        return indexesOfEmptySlots;
      },
      [],
    );
    return emptySlotsIndexes[randomInt(emptySlotsIndexes.length)];
  }
}

abstract class Slots<S> {
  constructor(protected value: S[]) {}

  get count() {
    return this.value.length;
  }
}

export class UnbeatenSlots extends Slots<UnbeatenSlot> {
  constructor(allSlots: DeskSlot[]) {
    super(
      allSlots.filter(
        (slot): slot is UnbeatenSlot => slot instanceof UnbeatenSlot,
      ),
    );
  }

  get cardCount() {
    return this.count;
  }

  get cards() {
    return this.value.map((slot) => slot.attackCard);
  }
}

export class FilledSlots extends Slots<UnbeatenSlot | DefendedSlot> {
  constructor(allSlots: DeskSlot[]) {
    super(
      allSlots.filter(
        (slot): slot is UnbeatenSlot | DefendedSlot =>
          slot instanceof UnbeatenSlot || slot instanceof DefendedSlot,
      ),
    );
  }
}

export class DefendedSlots extends Slots<DefendedSlot> {
  constructor(allSlots: DeskSlot[]) {
    super(
      allSlots.filter(
        (slot): slot is DefendedSlot => slot instanceof DefendedSlot,
      ),
    );
  }
}
