import type { AllowedMissingCardCount } from "@durak-game/durak-dts";
import { type CanProvideCards } from "../../DurakGame.js";
import type Card from "../Card/index.js";
import { type Discard } from "../Deck/index.js";
import type { DeskSlot } from "../DeskSlot/index.js";
import DeskSlots from "../DeskSlots/index.js";
import { DefendedSlots, FilledSlots, UnbeatenSlots } from "../DeskSlots/Slots.js";
import type { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import type { Defender } from "../Player/Defender.js";
import type GameDeskWebsocketService from "./Desk.service.js";
import { raise } from "../../../../index.js";

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
    return this.#slots.at(index) || raise(`Slot with index=${index} does not exist`);
  }

  get isAllowsMoves() {
    return this.allowedFilledSlotCount > this.filledSlots.count;
  }

  get ranks() {
    return new Set(this.#slots.cards.map((card) => card.rank));
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
    return this.isAllowsMoves;
  }

  get shouldDefenderMove(): boolean {
    return this.isAllowsMoves;
  }

  updateSlot(slot: DeskSlot, card: Card) {
    return this.#slots.updateSlot({ at: slot.index, with: card });
  }

  receiveCard({
    card,
    index,
    source,
  }: {
    card: Card;
    index: number;
    source: AllowedSuperPlayer;
  }) {
    this.#slots.updateSlot({ at: index, with: card });
    this.#wsService?.receiveCard({ card, index, source });
  }

  provideCards<Target extends Defender | Discard>(target: Target) {
    target.receiveCards(...this.#slots.cards);
    this.#slots = new DeskSlots(this.#slots.count);
    this.#wsService?.clear();
  }

  async ensureCanAttack(card: Card, slot: DeskSlot): Promise<void> {
    if (this.isEmpty) return;
    await slot.ensureCanBeAttacked(card);
    if (!this.#slots.someSlotHas({ rank: card.rank })) {
      throw new Error("Нет схожего ранга на доске");
    }
  }

  async allowsTransferMove(card: Card, slot: DeskSlot) {
    return this.#slots.allowsTransferMove(card, slot);
  }

  get randomEmptySlot() {
    return this.#slots.randomEmptySlot;
  }

  get cardsCount() {
    return this.#slots.cardsCount;
  }

  toJSON(): {
    slots: DeskSlot[];
  } {
    return { slots: [...this.#slots] };
  }
}
