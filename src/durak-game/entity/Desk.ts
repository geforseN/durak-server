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

  get cardCount(): number {
    return this.cards.length;
  }

  hasSameCardCount(cardCount: number | null): boolean {
    return this.cardCount === cardCount;
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

  get isDefended(): boolean {
    return this.slots.every((slot) => slot.isDefended);
  }

  insertAttackerCard({ index, card }: { index: number, card: Card }) {
    this.getSlot({ index }).insertAttackCard(card);
  }

  insertDefenderCard({ index, card }: { index: number, card: Card }) {
    this.getSlot({ index }).insertDefendCard(card);
  }

  insertCard({ index, card }: { index: number, card: Card }) {
    this.getSlot({ index }).insert({ card });
  }

  clear(): void {
    this.slots.forEach((slot) => slot.clear());
  }

  assertCanPut({ attackCard, slotIndex }: { attackCard: Card, slotIndex: number }) {
    const slot = this.getSlot({ index: slotIndex });
    if (this.isEmpty) return;
    if (slot.attackCard) throw new Error("Слот занят");
    if (!this.hasCardWithRank(attackCard.rank)) {
      throw new Error("Нет схожего ранга на доске");
    }
  }
}
