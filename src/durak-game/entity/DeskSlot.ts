import Card from "./Card";
import { Rank, Suit } from "../utility.durak";

export default class DeskSlot {
  constructor(
    public attackCard: Card | null = null,
    public defendCard: Card | null = null,
  ) {
  }

  get isFull(): boolean {
    return !!(this.attackCard && this.defendCard);
  }

  get isEmpty(): boolean {
    return !this.attackCard && !this.defendCard;
  }

  get isDefended(): boolean {
    return this.isEmpty || this.isFull;
  }

  get isUnbeaten(): boolean {
    return !!(this.attackCard && !this.defendCard);
  }

  get values(): Card[] {
    const values = [];
    if (this.attackCard) values.push(this.attackCard);
    if (this.defendCard) values.push(this.defendCard);
    return values;
  }

  hasSuit(suit: Suit): boolean {
    return this.attackCard?.suit === suit || this.defendCard?.suit === suit;
  }

  hasRank(rank: Rank): boolean {
    return this.attackCard?.rank === rank || this.defendCard?.rank === rank;
  }

  insertAttackCard(card: Card) {
    this.attackCard = card;
  }

  insertDefendCard(card: Card) {
    this.defendCard = card;
  }

  removeAttackCard() {
    this.attackCard = null;
  }

  removeDefendCard() {
    this.defendCard = null;
  }

  clear() {
    this.removeAttackCard();
    this.removeDefendCard();
  }

  assertAvalableForDefense(card: Card, trumpSuit: Suit) {
    if (this.defendCard) throw new Error("Карта уже побита");
    if (!this.attackCard) throw new Error("Нет от чего защищаться");

    if (this.attackCard.suit === trumpSuit) {
      if (card.suit !== trumpSuit) throw new Error("Козырную карту можно побить только козырной");
      if (card.power < this.attackCard.power) throw new Error("Вы кинули слабую карту");
    } else if (card.suit !== trumpSuit) {
      if (card.suit !== this.attackCard.suit) throw new Error("Вы кинули неверню масть");
      if (card.power < this.attackCard.power) throw new Error("Вы кинули слабую карту");
    }
  }

  insert({ card }: {card: Card}) {
    if (this.isEmpty) this.attackCard = card;
    else this.defendCard = card;
  }
}