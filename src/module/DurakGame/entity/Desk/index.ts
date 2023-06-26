import { randomInt } from "node:crypto";
import {
  Defender,
  Player,
  SuperPlayer,
  AllowedMissingCardCount,
} from "../Player";
import Card, { Rank } from "../Card";
import {
  DefendedSlot,
  DeskSlot,
  EmptySlot,
  UnbeatenSlot,
  UnbeatenTrumpSlot,
} from "../DeskSlot";
import { CanProvideCards } from "../../DurakGame.implimetntation";
import { Discard } from "../Deck";
import GameDeskService from "./Desk.service";

export default class Desk implements CanProvideCards<Defender | Discard> {
  slots: DeskSlot[];
  allowedFilledSlotCount: number;
  private service?: GameDeskService;

  constructor({
    allowedFilledSlotCount = 6,
    slotCount: length = 6,
  }: Partial<{
    allowedFilledSlotCount: AllowedMissingCardCount;
    slotCount: AllowedMissingCardCount;
  }> = {}) {
    this.allowedFilledSlotCount = allowedFilledSlotCount;
    this.slots = Array.from({ length }, () => new EmptySlot());
  }

  private get cards(): Card[] {
    return this.slots.flatMap((slot) => slot.value);
  }

  get cardCount(): number {
    return this.cards.length;
  }

  get ranks(): Rank[] {
    return [...new Set(this.cards.map((card) => card.rank))];
  }

  get unbeatenCardCount(): number {
    return this.slots.filter((slot) => slot instanceof UnbeatenSlot).length;
  }

  get allowsMoves() {
    return this.allowedFilledSlotCount > this.filledSlotsCount;
  }

  get filledSlotsCount(): number {
    return this.slots.filter((slot) => !(slot instanceof EmptySlot)).length;
  }

  get isEmpty(): boolean {
    return this.slots.every((slot) => slot instanceof EmptySlot);
  }

  get isDefended(): boolean {
    return this.defendedSlotsCount === this.filledSlotsCount;
  }

  private get defendedSlotsCount(): number {
    return this.slots.filter((slot) => slot instanceof DefendedSlot).length;
  }

  get allowsAttackerMove(): boolean {
    return this.allowsMoves;
  }

  get shouldDefenderMove(): boolean {
    return this.allowsMoves;
  }

  async allowsTransferMove(card: Card, slotIndex: number) {
    return (
      this.slots[slotIndex] instanceof EmptySlot &&
      Promise.all(
        this.slots.map((slot) => slot.ensureAllowsTransfer({ card })),
      ).then(
        () => true,
        () => false,
      )
    );
  }

  receiveCard({
    card,
    index,
    who,
  }: {
    card: Card;
    index: number;
    who: SuperPlayer;
  }) {
    this.slots[index] = this.nextDeskSlot({ card, slot: this.slots[index] });
    this.service?.receiveCard({ card, index, who });
  }

  provideCards<T extends Defender | Discard>(target: T) {
    target.receiveCards(...this.cards);
    this.clear();
  }

  private clear() {
    this.slots.forEach((_, index) => (this.slots[index] = new EmptySlot()));
    this.service?.clear();
  }

  async ensureCanAttack(card: Card, slotIndex: number): Promise<Card> {
    if (this.isEmpty) return card;
    await this.slots[slotIndex].ensureCanBeAttacked({ card });
    await this.assertCanPut(card);
    return card;
  }

  private async assertCanPut(card: Card): Promise<Card> {
    if (!this.hasSame({ rank: card.rank })) {
      throw new Error("Нет схожего ранга на доске");
    }
    return card;
  }

  private hasSame({ rank }: { rank: Rank }) {
    return this.slots.some((slot) => slot.has({ rank }));
  }

  private nextDeskSlot({ card, slot }: { card: Card; slot: DeskSlot }) {
    if (slot instanceof EmptySlot) {
      return card.isTrump
        ? new UnbeatenTrumpSlot(card)
        : new UnbeatenSlot(card);
    }
    if (slot instanceof UnbeatenSlot) {
      return new DefendedSlot(slot.attackCard, card);
    }
    throw new Error("Can not update slot");
  }

  injectService(gameDeskService: GameDeskService) {
    this.service = gameDeskService;
  }

  get randomSlotIndex() {
    return randomInt(0, this.slots.length);
  }
}
