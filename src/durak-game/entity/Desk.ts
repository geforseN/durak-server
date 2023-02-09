import Card from "./Card";
import DeskSlot from "./DeskSlot";
import { Rank, Suit } from "../utility.durak";

export default class Desk {
  slots: DeskSlot[];
  maxSlotCount: number;

  constructor(slotCount = 6) {
    this.maxSlotCount = slotCount;
    this.slots = [...Array(slotCount)].map(() => new DeskSlot());
  }

  get cards(): Card[] {
    return this.slots.flatMap((slot) => slot.values);
  }

  getSlot({ index }: { index: number }): DeskSlot {
    return this.slots[index];
  }

  hasCardWithSuit(suit: Suit): boolean {
    return this.slots.some((slot) => slot.hasSuit(suit));
  }

  hasCardWithRank(rank: Rank): boolean {
    return this.slots.some((slot) => slot.hasRank(rank));
  }

  get isEmpty(): boolean {
    return this.slots.every((slot) => slot.isEmpty);
  }

  get isFull(): boolean {
    return this.slots.every((slot) => slot.isFull);
  }

  get isNonEmptySlotsDefended(): boolean {
    return this.slots.every((slot) => !slot.attackCard || (slot.attackCard && slot.defendCard));
  }

  insertAttackerCard({ index, card }: { index: number, card: Card }) {
    this.getSlot({ index }).insertAttackCard(card);
  }

  insertDefenderCard({ index, card }: { index: number, card: Card }) {
    this.getSlot({ index }).insertDefendCard(card);
  }

  clear(): void {
    this.slots.forEach((slot) => slot.clear());
  }
}
