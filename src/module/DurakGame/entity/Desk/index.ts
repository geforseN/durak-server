import type { Defender, SuperPlayer, AllowedMissingCardCount } from "../Player";
import type Card from "../Card";
import { type CanProvideCards } from "../../DurakGame";
import { type Discard } from "../Deck";
import type GameDeskWebsocketService from "./Desk.service";
import DeskSlots, {
  DefendedSlots,
  FilledSlots,
  UnbeatenSlots,
} from "../DeskSlots";
import { raise } from "../../../..";

export default class Desk implements CanProvideCards<Defender | Discard> {
  #slots: DeskSlots;
  readonly allowedFilledSlotCount: number;
  readonly #wsService: GameDeskWebsocketService;

  constructor(
    settings: {
      allowedFilledSlotCount: AllowedMissingCardCount;
      slotCount: AllowedMissingCardCount;
    },
    wsService: GameDeskWebsocketService,
  ) {
    this.allowedFilledSlotCount = settings.allowedFilledSlotCount;
    this.#slots = new DeskSlots(settings.slotCount);
    this.#wsService = wsService;
  }

  *[Symbol.iterator]() {
    yield* this.#slots;
  }

  slotAt(index: number) {
    return this.#slots.at(index);
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
    return this.#slots.isEverySlotEmpty;
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
    source,
  }: {
    card: Card;
    index: number;
    source: SuperPlayer;
  }) {
    this.#slots.updateSlot({ at: index, with: card });
    this.#wsService?.receiveCard({ card, index, source });
  }

  provideCards<Target extends Defender | Discard>(target: Target) {
    target.receiveCards(...this.#slots.cards);
    this.#slots = new DeskSlots(this.#slots.count);
    this.#wsService?.clear();
  }

  async ensureCanAttack(card: Card, slotIndex: number): Promise<void> {
    if (this.isEmpty) return;
    await this.slotAt(slotIndex).ensureCanBeAttacked(card);
    if (!this.#slots.someSlotHas({ rank: card.rank })) {
      throw new Error("Нет схожего ранга на доске");
    }
  }

  async allowsTransferMove(card: Card, slotIndex: number) {
    return this.#slots.allowsTransferMove(card, slotIndex);
  }

  get randomEmptySlotIndex() {
    return this.#slots.randomEmptySlotIndex;
  }

  get cardsCount() {
    return this.#slots.cardsCount;
  }
}
