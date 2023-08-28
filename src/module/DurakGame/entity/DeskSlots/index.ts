import { DeskSlot, EmptySlot } from "../DeskSlot";
import Card, { Rank } from "../Card";
import { randomInt } from "node:crypto";
import { raise } from "../../../..";

export default class DeskSlots {
  readonly #value: DeskSlot[];

  constructor(length: number) {
    this.#value = Array.from({ length }, (_, index) => new EmptySlot(index));
  }

  get isEverySlotEmpty(): boolean {
    return this.#value.every((slot) => slot.isEmpty());
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
    const emptySlotsIndexes = this.#value
      .filter((slot) => slot.isEmpty())
      .map((slot) => slot.index);
    return emptySlotsIndexes[randomInt(emptySlotsIndexes.length)];
  }
}
