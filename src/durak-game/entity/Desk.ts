import Card from "./Card";
import { DeskSlot } from "./DeskSlot";
import { Rank, Suit } from "../utility.durak";

export default class Desk {
  slots: DeskSlot[];
  maxSlotCount: number;

  constructor(slotCount = 6) {
    this.maxSlotCount = slotCount;
    this.slots = new Array(slotCount).fill(new DeskSlot());
  }

  get cards(): Card[] {
    return this.slots.flatMap((slot) => slot.values);
  }

  hasCardWithSuit(suit: Suit): boolean {
    return this.slots.some((slot) => slot.hasSuit(suit));
  }

  hasCardWithRank(rank: Rank): boolean {
    return this.slots.some((slot) => slot.hasRank(rank));
  }

  get isEmpty(): boolean {
    return this.slots.some((slot) => slot.isEmpty);
  }

  get isFull(): boolean {
    return this.slots.every((slot) => slot.isFull);
  }

  putAttackerCard({ index, card }: { index: number, card: Card }) {
    this.slots[index].pushAttackCard(card);
  }

  putDefenderCard({ index, card }: { index: number, card: Card }) {
    this.slots[index].pushDefendCard(card);
  }

  clear(): void {
    this.slots.forEach((slot) => slot.clear());
  }

  ensureCorrectIndex(index: number): this | never {
    const isInt = Number.isInteger(index);
    const isInRange = index >= 0 && index <= this.maxSlotCount;
    if (!isInt || !isInRange) throw new Error("Некорректный индекс");
    return this;
  }

  ensureCanPut() {

  }
}
