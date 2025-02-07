import type Card from "@/module/DurakGame/entity/Card/index.js";
import TrumpCard from "@/module/DurakGame/entity/Card/trump-card.js";
import Deck from "@/module/DurakGame/entity/Deck/deck.js";

export default class Talon {
  #deck: Deck<Card>;
  #trumpCard: TrumpCard;

  constructor(
    private readonly cards: Card[],
    private readonly hooks: { onEmpty?: () => void } = {},
  ) {
    this.#deck = new Deck(cards);
    this.#trumpCard = TrumpCard.from(cards[0]);
  }

  isEmpty() {
    return this.#deck.isEmpty
  }

  pop(count: number) {
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError("Argument count must be a positive integer");
    }
    const startIndex = this.#deck.count - count;
    if (startIndex <= 0) {
      const lastCards = this.cards.splice(0, this.#deck.count);
      this.hooks.onEmpty?.();
      return lastCards;
    }
    return this.cards.splice(startIndex, count);
  }

  toJSON() {
    return {
      hasOneCard: this.#deck.count === 1,
      isEmpty: this.#deck.isEmpty,
      trumpCard: this.#trumpCard.toJSON(),
    };
  }
}
