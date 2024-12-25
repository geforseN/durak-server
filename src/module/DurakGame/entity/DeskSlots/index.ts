import { randomInt } from "node:crypto";

import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";

import raise from "@/common/raise.js";
import EmptySlot from "@/module/DurakGame/entity/DeskSlot/EmptySlot.js";

export default class DeskSlots {
  readonly #value: DeskSlot[];

  constructor(values: DeskSlot[]) {
    this.#value = values;
  }

  static clean(length: number) {
    return new DeskSlots(
      Array.from({ length }, (_, index) => new EmptySlot(index)),
    );
  }

  at(index: number): DeskSlot {
    return this.#value.at(index) || raise();
  }

  ensureAllowsTransferMove(card: Card) {
    for (const slot of this.#value) {
      slot.ensureAllowsTransferMove(card);
    }
  }

  someSlotHasSameRank(rank: Card["rank"]) {
    return this.#value.some((slot) =>
      slot.cards.some((card) => card.rank.isEqualTo(rank)),
    );
  }

  asClean() {
    return DeskSlots.clean(this.count);
  }

  with(slot: DeskSlot, card: Card) {
    return new DeskSlots(this.#value.with(slot.index, slot.nextDeskSlot(card)));
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

  toJSON() {
    return this.#value.map((slot) => slot.toJSON());
  }
}
