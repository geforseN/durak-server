import GameDeskService from "./Services/Desk.service";
import { Defender, Player, SuperPlayer } from "./Players";
import Card from "./Card";
import { DefendedSlot, DeskSlot, EmptySlot, UnbeatenSlot, UnbeatenTrumpSlot } from "./DeskSlot";
import { CanProvideCards } from "../DurakGame";
import Discard from "./Deck/Discard";
import { AllowedMissingCardCount } from "./Players/Player";

export default class Desk implements CanProvideCards<Defender | Discard> {
  slots: DeskSlot[];
  allowedMaxFilledSlotCount: number;
  private service?: GameDeskService;

  constructor({ allowedMaxFilledSlotCount = 6, slotCount = 6 }: Partial<{
    allowedMaxFilledSlotCount: AllowedMissingCardCount,
    slotCount: AllowedMissingCardCount
  }> = {}) {
    this.allowedMaxFilledSlotCount = allowedMaxFilledSlotCount;
    this.slots = [...Array(slotCount)].map(() => new EmptySlot());
  }

  getSlot({ index }: { index: number }): DeskSlot {
    return this.slots[index];
  }

  private get cards(): Card[] {
    return this.slots.flatMap((slot) => slot.value);
  }

  get cardCount(): number {
    return this.cards.length;
  }

  get unbeatenCardCount(): number {
    return this.slots.filter((slot) => slot instanceof UnbeatenSlot).length;
  };

  get allowsMoves() {
    return this.allowedMaxFilledSlotCount > this.filledSlotsCount;
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

  allowsTransferMove({ card, index, nextDefender }: { nextDefender: Player; index: number; card: Card }) {
    return (
      this.getSlot({ index }) instanceof EmptySlot
      && nextDefender.canTakeMore({ cardCount: this.cardCount })
      && Promise.all(
        this.slots.map((slot) => slot.allowsTransfer({ card })),
      ).then(() => true, () => false)
    );
  }

  receiveCard({ card, index, who }: { card: Card, index: number, who: SuperPlayer }) {
    const slot = this.getSlot({ index });
    this.slots[index] = this.nextDeskSlot({ card, slot });
    this.service?.insertCard({ card, index, who });
  }

  provideCards<T extends Defender | Discard>(target: T) {
    target.receiveCards(...this.cards);
    this.clear();
  }

  private clear() {
    this.slots.forEach((_, index) => (this.slots[index] = new EmptySlot()));
    this.service?.clearDesk();
  }

  checkCanAttack({ card, index }: { card: Card, index: number }): Promise<Card> {
    return new Promise<Card>((resolve, reject) => {
      if (this.isEmpty) resolve(card);
      const slot = this.getSlot({ index });
      slot.assertCanBeAttacked({ card })
        .then((card) => this.assertCanPut(card))
        .then(resolve)
        .catch(reject);
    });
  }

  private assertCanPut(card: Card): Promise<Card> {
    return new Promise<Card>((resolve, reject) => {
      if (!this.hasSame({ rank: card.rank })) {
        reject("Нет схожего ранга на доске");
      } else resolve(card);
    });
  }

  private hasSame({ rank }: { rank: Card["rank"] }) {
    return this.slots.some((slot) => slot.has({ rank }));
  }

  private nextDeskSlot({ card, slot }: { card: Card, slot: DeskSlot }) {
    if (slot instanceof EmptySlot) {
      return card.isTrump
        ? new UnbeatenTrumpSlot(card)
        : new UnbeatenSlot(card);
    }
    if (slot instanceof UnbeatenSlot) {
      return new DefendedSlot(slot.attackCard, card);
    }
    const isSlotFull: boolean = slot instanceof DefendedSlot;
    throw new Error("Can not update slot" + (isSlotFull && ", slot is full"));
  }

  injectService(gameDeskService: GameDeskService) {
    this.service = gameDeskService;
  }

  toString(): string {
    return this.slots.map((slot) => slot.toString()).join(" ");
  }
}

