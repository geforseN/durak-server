import type { Defender, SuperPlayer, AllowedMissingCardCount } from "../Player";
import type Card from "../Card";
import { type CanProvideCards } from "../../DurakGame.implimetntation";
import { type Discard } from "../Deck";
import type GameDeskService from "./Desk.service";
import DeskSlots, {
  DefendedSlots,
  FilledSlots,
  UnbeatenSlots,
} from "../DeskSlots";

export default class Desk implements CanProvideCards<Defender | Discard> {
  slots: DeskSlots;
  allowedFilledSlotCount: number;
  private service?: GameDeskService;

  constructor({
    allowedFilledSlotCount = 6,
    slotCount = 6,
  }: Partial<{
    allowedFilledSlotCount: AllowedMissingCardCount;
    slotCount: AllowedMissingCardCount;
  }> = {}) {
    this.allowedFilledSlotCount = allowedFilledSlotCount;
    this.slots = new DeskSlots(slotCount);
  }

  *[Symbol.iterator]() {
    yield* this.slots;
  }

  slotAt(index: number) {
    return this.slots.at(index);
  }

  get allowsMoves() {
    return this.allowedFilledSlotCount > this.filledSlots.count;
  }

  get unbeatenSlots() {
    return new UnbeatenSlots([...this]);
  }

  get filledSlots() {
    return new FilledSlots([...this]);
  }

  get defendedSlots() {
    return new DefendedSlots([...this]);
  }

  get isEmpty(): boolean {
    return this.slots.isEverySlotEmpty;
  }

  get isDefended(): boolean {
    return this.defendedSlots.count === this.filledSlots.count;
  }

  get allowsAttackerMove(): boolean {
    return this.allowsMoves;
  }

  get shouldDefenderMove(): boolean {
    return this.allowsMoves;
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
    this.slots.updateSlot({ at: index, with: card });
    this.service?.receiveCard({ card, index, who });
  }

  provideCards<T extends Defender | Discard>(target: T) {
    target.receiveCards(...this.slots.cards);
    this.#clear();
  }

  #clear() {
    this.slots = new DeskSlots(this.slots.count);
    this.service?.clear();
  }

  async ensureCanAttack(card: Card, slotIndex: number): Promise<Card> {
    if (this.isEmpty) return card;
    await this.slotAt(slotIndex)?.ensureCanBeAttacked(card);
    this.#ensureCanPut(card);
    return card;
  }

  #ensureCanPut(card: Card) {
    if (!this.slots.someSlotHas({ rank: card.rank })) {
      throw new Error("Нет схожего ранга на доске");
    }
  }

  injectService(gameDeskService: GameDeskService) {
    this.service = gameDeskService;
  }
}
