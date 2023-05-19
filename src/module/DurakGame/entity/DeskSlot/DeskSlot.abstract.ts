import Card, { Rank } from "../Card";

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;

  abstract get value(): Card[]

  has({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  abstract ensureCanBeDefended({ card }: { card: Card }): Promise<Card> | never

  abstract ensureCanBeAttacked({ card }: { card: Card }): Promise<Card> | never

  ensureAllowsTransfer({ card }: { card: Card }): Promise<Card> | never {
    if (!this.attackCard?.hasSame({ rank: card.rank })) {
      return Promise.reject(new Error("Нельзя перевести: нет схожего ранга"));
    }
    return Promise.resolve(card);
  }
}