import { DeskSlot, EmptySlot } from "../DeskSlot/index.js";
import Card, { Rank } from "../Card/index.js";
import { randomInt } from "node:crypto";
import { raise } from "../../../../index.js";

export default class DeskSlots {
  readonly #value: DeskSlot[];

  constructor(length: number) {
    this.#value = Array.from({ length }, (_, index) => new EmptySlot(index));
  }

  toEmpty() {
    return new DeskSlots(this.count);
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

  update(slot: DeskSlot, card: Card) {
    const nextSlot = slot.nextDeskSlot(card);
    this.#value[slot.index] = nextSlot;
  }

  async ensureAllowsTransferMove(card: Card): Promise<void> {
    return void Promise.all(
      this.#value.map((slot) => slot.ensureAllowsTransfer(card)),
    );
  }

  at(index: number): DeskSlot {
    return this.#value.at(index) || raise();
  }

  someSlotHasSameRank(rank: Rank) {
    return this.#value.some((slot) => slot.has({ rank }));
  }

  get randomEmptySlot() {
    const emptySlots = this.#value.filter((slot) => slot.isEmpty());
    return emptySlots[randomInt(emptySlots.length)];
  }
}
