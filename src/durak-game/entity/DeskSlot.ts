import Card from "./Card";
import { Rank, Suit } from "../utility";

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

  has({ rank }: { rank: Rank }): boolean {
    return this.attackCard?.hasSame({ rank }) || this.defendCard?.rank === rank;
  }

  clear() {
    this.attackCard = null;
    this.defendCard = null;
  }

  assertAvalableForDefense({ card, trumpSuit }: { card: Card, trumpSuit: Suit }) {
    if (this.defendCard) throw new Error("Карта уже побита");
    if (!this.attackCard) throw new Error("Нет от чего защищаться");

    const cardsHasSameSuit = this.attackCard.hasSame({ suit: card.suit });
    const attackCardIsTrump = this.attackCard.hasSame({ suit: trumpSuit });
    const cardIsTrump = card.hasSame({ suit: trumpSuit });

    if (!attackCardIsTrump && cardIsTrump) return;
    if (attackCardIsTrump && !cardIsTrump) throw new Error("Козырную карту можно побить только козырной");
    if (!attackCardIsTrump && !cardsHasSameSuit) throw new Error("Вы кинули неверню масть");
    if (cardsHasSameSuit && card.weakerThan(this.attackCard)) throw new Error("Вы кинули слабую карту");
  }

  insert({ card: { suit, rank } }: { card: Card }) {
    if (this.isEmpty) this.attackCard = new Card({ suit, rank });
    else this.defendCard = new Card({ suit, rank });
  }

  hasOnlyAttackCardWith({ rank }: { rank: Rank }) {
    return !this.defendCard && this.attackCard?.hasSame({ rank });
  }

  toString(): string {
    return `[${this.attackCard ?? ""}_${this.defendCard ?? ""}]`;
  }
}