import Card from "../Card";
import { DefenderMove, DefenderMoveConstructorArgs } from "./DefenderMove";

type TransferMoveConstructorArgs = DefenderMoveConstructorArgs & { card: Card, slotIndex: number };

export class TransferMove extends DefenderMove {
  card: Card;
  slotIndex: number;

  constructor({ player, deskCardCount, ...args }: TransferMoveConstructorArgs) {
    super({ player, deskCardCount });
    this.card = args.card;
    this.slotIndex = args.slotIndex;
  }
}