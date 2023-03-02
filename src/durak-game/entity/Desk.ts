import Card from "./Card";
import DeskSlot from "./DeskSlot";
import { Rank } from "../utility";

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

  get cardCount(): number {
    return this.cards.length;
  }

  get unbeatenCardCount(): number {
    return this.slots.filter((slot) => slot.isUnbeaten).length;
  };

  allowsTransferMove({ card: { rank } }: { card: Card }) {
    return this.slots.every((slot) => slot.isEmpty || slot.hasOnlyAttackCardWith({ rank }));
  }

  getSlot({ index }: { index: number }): DeskSlot {
    return this.slots[index];
  }

  hasCardWith({ rank }: { rank: Rank }): boolean {
    return this.slots.some((slot) => slot.has({ rank }));
  }

  get isEmpty(): boolean {
    return this.slots.every((slot) => slot.isEmpty);
  }

  get isFull(): boolean {
    return this.slots.every((slot) => slot.isFull);
  }

  get isDefended(): boolean {
    return this.slots.every((slot) => slot.isDefended);
  }

  insertCard({ index, card }: { index: number, card: Card }) {
    this.getSlot({ index }).insert({ card });
  }

  clear(): void {
    this.slots.forEach((slot) => slot.clear());
  }

  assertCanPut({ attackCard: { rank }, slotIndex }: { attackCard: Card, slotIndex: number }) {
    const slot = this.getSlot({ index: slotIndex });
    if (this.isEmpty) return;
    if (slot.attackCard) throw new Error("Слот занят");
    if (!this.hasCardWith({ rank })) {
      throw new Error("Нет схожего ранга на доске");
    }
  }

  toString(): string {
    return this.slots.map((slot) => slot.toString()).join(" ");
  }
}
