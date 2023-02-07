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
}