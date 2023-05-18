import Card from "../entity/Card";
import { Rank } from "../utility";

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;

  abstract get value(): Card[]

  has({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  abstract ensureCanBeDefended({ card }: { card: Card }): Promise<Card>

  abstract ensureCanBeAttacked({ card }: { card: Card }): Promise<Card>

  abstract ensureAllowsTransfer({ card }: { card: Card }): Promise<Card>
}