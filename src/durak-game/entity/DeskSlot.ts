import Card from "./Card";
import { Rank, Suit } from "../utility.durak";
import DurakGame from "../durak-game";


export default class DeskSlot {
  constructor(
    public attackCard: Card | null = null,
    public defendCard: Card | null = null,
  ) {
  }

  get hasAttackCard(): boolean {
    return this.attackCard !== null;
  }

  get hasDefendCard(): boolean {
    return this.defendCard !== null;
  }

  get isFull(): boolean {
    return this.hasAttackCard && this.hasDefendCard;
  }

  get isEmpty(): boolean {
    return !this.hasAttackCard && !this.hasDefendCard;
  }

  hasTrumpAttackCard({ game }: { game: DurakGame }): boolean {
    return this.attackCard!?.isTrump({ game });
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

  insertAttackCard(card: Card) {
    this.attackCard = card;
  }

  insertDefendCard(card: Card) {
    this.defendCard = card;
  }
}