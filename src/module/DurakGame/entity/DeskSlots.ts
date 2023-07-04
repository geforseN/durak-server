import { DefendedSlot, DeskSlot, EmptySlot, UnbeatenSlot } from "./DeskSlot";
import Card, { Rank } from "./Card";
import { randomInt } from "node:crypto";
import NextDeskSlot from "./DeskSlot/NextDeskSlot";

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
    this.#value[index] = new NextDeskSlot(this.#value[index], card).correctSlot;
  }

  async allowsTransferMove(card: Card, slotIndex: number): Promise<boolean> {
    if (this.at(slotIndex) instanceof EmptySlot) {
      return Promise.reject(false);
    }
    return Promise.all(
      this.#value.map((slot) => slot.ensureAllowsTransfer(card)),
    ).then(
      () => true,
      () => false,
    );
  }

  at(index: number) {
    return this.#value.at(index);
  }

  someSlotHas({ rank }: { rank: Rank }) {
    return this.#value.some((slot) => slot.has({ rank }));
  }

  get randomSlotIndex(): number {
    return randomInt(0, this.count);
  }
}

abstract class Slots {
  value: DeskSlot[] = [];

  get count() {
    return this.value.length;
  }
}

export class UnbeatenSlots extends Slots {
  constructor(allSlots: DeskSlot[]) {
    super();
    this.value = allSlots.filter((slot) => slot instanceof UnbeatenSlot);
  }

  get cardCount() {
    return this.count;
  }
}

export class FilledSlots extends Slots {
  constructor(allSlots: DeskSlot[]) {
    super();
    this.value = allSlots.filter((slot) => !(slot instanceof EmptySlot));
  }
}

export class DefendedSlots extends Slots {
  constructor(allSlots: DeskSlot[]) {
    super();
    this.value = allSlots.filter((slot) => slot instanceof DefendedSlot);
  }
}
