import { randomInt } from "node:crypto";

import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";

import raise from "@/common/raise.js";
import EmptySlot from "@/module/DurakGame/entity/DeskSlot/EmptySlot.js";

export default class DeskSlots {
  readonly #values: DeskSlot[];

  constructor(values: DeskSlot[]) {
    this.#values = values;
  }

  static clean(length: number) {
    return new DeskSlots(
      Array.from({ length }, (_, index) => new EmptySlot(index)),
    );
  }

  at(index: number): DeskSlot {
    return this.#values.at(index) || raise();
  }

  ensureAllowsTransferMove(card: Card) {
    for (const slot of this.#values) {
      slot.ensureAllowsTransferMove(card);
    }
  }

  someSlotHasSameRank(rank: Card["rank"]) {
    return this.#values.some((slot) =>
      slot.cards.some((card) => card.rank.isEqualTo(rank)),
    );
  }

  asClean() {
    return DeskSlots.clean(this.count);
  }

  with(slot: DeskSlot, card: Card) {
    return new DeskSlots(
      this.#values.with(slot.index, slot.nextDeskSlot(card)),
    );
  }

  update(slot: DeskSlot, card: Card) {
    this.#values[slot.index] = slot.nextDeskSlot(card);
  }

  get cards(): Card[] {
    return this.#values.flatMap((slot) => slot.value);
  }

  get cardsCount(): number {
    return this.cards.length;
  }

  get count() {
    return this.#values.length;
  }

  get isEverySlotEmpty(): boolean {
    return this.#values.every((slot) => slot.isEmpty());
  }

  get randomEmptySlot() {
    const emptySlots = this.#values.filter((slot) => slot.isEmpty());
    return emptySlots[randomInt(emptySlots.length)];
  }

  toJSON() {
    return this.#values.map((slot) => slot.toJSON());
  }
}
