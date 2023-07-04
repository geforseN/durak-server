import crypto from "node:crypto";
import assert from "node:assert";
import Deck from "../Deck.abstract";
import Card from "../../Card";
import { CardDTO } from "../../../DTO";

export default class Hand extends Deck {
  constructor() {
    super();
  }

  has({ rank, suit }: ConstructorParameters<typeof Card>[0]): boolean {
    return this.value.some((card) => card.hasSame({ suit, rank }));
  }

  // TODO TrumpCard class will be implemented
  get({ rank, suit }: CardDTO) {
    const foundCard = this.value.find((card) => card.hasSame({ rank, suit }));
    assert.ok(foundCard, "У вас нет такой карты");
    return foundCard;
  }

  receive(...cards: Card[]): void {
    this.value.push(...cards);
  }

  #getCardIndex({ card: { suit, rank } }: { card: Card }): number {
    const index = this.value.findIndex((card) => card.hasSame({ suit, rank }));
    assert.ok(index > 0, "Неверный индекс");
    return index;
  }

  removeCard(card: Card) {
    const index = this.#getCardIndex({ card });
    const [removedCard] = this.value.splice(index, 1);
    assert.ok(removedCard, "Не получилось убрать свою карту");
    return removedCard;
  }

  get randomCard() {
    return this.value[crypto.randomInt(0, this.count)];
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }
}

// TODO: work with class or delete class
class SuperHand extends Hand {
  override removeCard(card: Card): Card {
    return super.removeCard(card);
  }

  override get randomCard() {
    return super.randomCard;
  }
}
