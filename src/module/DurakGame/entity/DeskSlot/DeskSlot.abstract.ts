import Card, { Rank } from "../Card";

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;

  abstract get value(): Card[];

  has({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  abstract ensureCanBeDefended(card: Card): Promise<Card> | never;

  abstract ensureCanBeAttacked(card: Card): Promise<Card> | never;

  async ensureAllowsTransfer(card: Card): Promise<Card> {
    if (!this.attackCard?.hasSame({ rank: card.rank })) {
      throw new Error("Нельзя перевести: нет схожего ранга");
    }
    return card;
  }
}
