import type { AllowedMissingCardCount } from "@durak-game/durak-dts";
import { type CanProvideCards } from "../../DurakGame.js";
import type Card from "../Card/index.js";
import { type Discard } from "../Deck/index.js";
import type { DeskSlot } from "../DeskSlot/index.js";
import DeskSlots from "../DeskSlots/index.js";
import {
  DefendedSlots,
  FilledSlots,
  UnbeatenSlots,
} from "../DeskSlots/Slots.js";
import type { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import type { Defender } from "../Player/Defender.js";
import type GameDeskWebsocketService from "./Desk.service.js";
import raise from "../../../../common/raise.js";
import { AllowedPlayerBadInputError } from "../../error/index.js";

export default class Desk implements CanProvideCards<Defender | Discard> {
  #slots: Readonly<DeskSlots>;
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
    return (
      this.#slots.at(index) || raise(`Slot with index=${index} does not exist`)
    );
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

  update(slot: DeskSlot, card: Card, performer: AllowedSuperPlayer) {
    this.#slots.update(slot, card);
    this.#wsService?.update(slot, card, performer);
  }

  provideCards<Target extends Defender | Discard>(target: Target) {
    target.receiveCards(...this.#slots.cards);
    this.#slots = this.#slots.toEmpty();
    this.#wsService?.clear();
  }

  ensureIncludesRank(rank: Card["rank"]): void {
    if (this.#slots.someSlotHasSameRank(rank)) {
      return;
    }
    throw new AllowedPlayerBadInputError("Нет схожего ранга на доске");
  }

  async ensureAllowsTransferMove(card: Card) {
    return this.#slots.ensureAllowsTransferMove(card);
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
