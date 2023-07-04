import type { Defender, SuperPlayer, AllowedMissingCardCount } from "../Player";
import type Card from "../Card";
import { type CanProvideCards } from "../../DurakGame.implimetntation";
import { type Discard } from "../Deck";
import type GameDeskWebscoketService from "./Desk.service";
import DeskSlots, {
  DefendedSlots,
  FilledSlots,
  UnbeatenSlots,
} from "../DeskSlots";

export default class Desk implements CanProvideCards<Defender | Discard> {
  #slots: DeskSlots;
  readonly allowedFilledSlotCount: number;
  readonly #wsService: GameDeskWebscoketService;

  constructor(
    settings: {
      allowedFilledSlotCount: AllowedMissingCardCount;
      slotCount: AllowedMissingCardCount;
    },
    wsService: GameDeskWebscoketService,
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
    who,
  }: {
    card: Card;
    index: number;
    who: SuperPlayer;
  }) {
    this.#slots.updateSlot({ at: index, with: card });
    this.#wsService?.receiveCard({ card, index, who });
  }

  provideCards<T extends Defender | Discard>(target: T) {
    target.receiveCards(...this.#slots.cards);
    this.#clear();
  }

  #clear() {
    this.#slots = new DeskSlots(this.#slots.count);
    this.#wsService?.clear();
  }

  async ensureCanAttack(card: Card, slotIndex: number): Promise<Card> {
    if (this.isEmpty) return card;
    await this.slotAt(slotIndex)?.ensureCanBeAttacked(card);
    this.#ensureCanPut(card);
    return card;
  }

  #ensureCanPut(card: Card) {
    if (!this.#slots.someSlotHas({ rank: card.rank })) {
      throw new Error("Нет схожего ранга на доске");
    }
  }

  async allowsTransferMove(card: Card, slotIndex: number) {
    return this.#slots.allowsTransferMove(card, slotIndex);
  }

  get randomSlotIndex() {
    return this.#slots.randomSlotIndex;
  }

  get cardsCount() {
    return this.#slots.cardsCount;
  }
}
