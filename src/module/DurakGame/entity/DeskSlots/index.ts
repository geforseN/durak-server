import { randomInt } from "node:crypto";

import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";

import { raise } from "@/utils/index.js";
import EmptySlot from "@/module/DurakGame/entity/DeskSlot/EmptySlot.js";

export default class DeskSlots {
  readonly #value: DeskSlot[];

  constructor(length: number) {
    this.#value = Array.from({ length }, (_, index) => new EmptySlot(index));
  }

  static __test_only_deskSlots(slotValues: [number, Card?, Card?][]) {
    const slots = new DeskSlots(slotValues.length);
    for (const [index, attackCard, defendCard] of slotValues) {
      if (attackCard) {
        slots.update(slots.at(index), attackCard);
      }
      if (defendCard) {
        slots.update(slots.at(index), defendCard);
      }
    }
    return slots;
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  at(index: number): DeskSlot {
    return this.#value.at(index) || raise();
  }

  async ensureAllowsTransferMove(card: Card): Promise<void> {
    return void Promise.all(
      this.#value.map((slot) =>
        slot.ensureAllowsTransferMoveForRank(card.rank),
      ),
    );
  }

  someSlotHasSameRank(rank: Card["rank"]) {
    return this.#value.some((slot) => slot.hasCardWith({ rank }));
  }

  toEmpty() {
    return new DeskSlots(this.count);
  }

  update(slot: DeskSlot, card: Card) {
    this.#value[slot.index] = slot.nextDeskSlot(card);
  }

  get cards(): Card[] {
    return this.#value.flatMap((slot) => slot.value);
  }

  get cardsCount(): number {
    return this.cards.length;
  }

  get count() {
    return this.#value.length;
  }

  get isEverySlotEmpty(): boolean {
    return this.#value.every((slot) => slot.isEmpty());
  }

  get randomEmptySlot() {
    const emptySlots = this.#value.filter((slot) => slot.isEmpty());
    return emptySlots[randomInt(emptySlots.length)];
  }
}
