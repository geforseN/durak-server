import Card from "../Card";
import { Rank } from "../../utility";

export default abstract class DeskSlot {
  attackCard?: Card;
  defendCard?: Card;

  abstract get value(): Card[]

  has({ rank }: { rank: Rank }): boolean {
    return this.value.some((card) => card.hasSame({ rank }));
  }

  abstract assertCanBeDefended({ card }: { card: Card }): Promise<Card>
  abstract assertCanBeAttacked({ card }: { card: Card }): Promise<Card>
  abstract allowsTransfer({ card }: { card: Card }): Promise<Card>

  toString(): string {
    return `[${this.attackCard ?? ""}_${this.defendCard ?? ""}]`;
  }
}