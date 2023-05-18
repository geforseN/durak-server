import { DeskSlot, EmptySlot } from "../DeskSlot";
import Card from "./Card";

export default class DeskSlots {
  value: DeskSlot[];

  constructor() {
    this.value = [];
  }

  get count() {
    return this.value.length;
  }

  private get cards(): Card[] {
    return this.value.flatMap((slot) => slot.value);
  }

  get cardCount(): number {
    return this.cards.length;
  }

  filled(): DeskSlot[] {
    return this.value.filter((slot) => !(slot instanceof EmptySlot));
  }

  allowsTransferMove({ card }: { card: Card }): Promise<Card[]> {
    return Promise.all(this.value.map((slot) => slot.allowsTransfer({ card })));
  }

  at(index: number) {
    return this.value.at(index);
  }
}