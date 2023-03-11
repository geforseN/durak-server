import Card from "./Card";
import DeskSlot from "./DeskSlot";
import { Rank } from "../utility";
import Player from "./Players/Player";

export default class Desk {
  slots: DeskSlot[];

  constructor(slotCount = 6) {
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

  allowsTransferMove({ card, slot, nextDefender }: { nextDefender: Player; slot: DeskSlot; card: Card }) {
    return (
      slot.isEmpty
      && nextDefender.canTakeMore({ cardCount: this.cardCount })
      && this.slots.every((slot) => slot.allowsTransferMove({ card }))
    );
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
