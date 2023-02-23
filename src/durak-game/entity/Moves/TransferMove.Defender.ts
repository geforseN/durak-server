import Card from "../Card";
import { DefenderMove, DefenderMoveConstructorArgs } from "./DefenderMove";

type TransferMoveConstructorArgs = DefenderMoveConstructorArgs & { card: Card, deskIndex: number };

export class TransferMove extends DefenderMove {
  card: Card;
  slotIndex: number;
  // from?: Player;
  // to?: Player;

  constructor({ allowedPlayer, deskCardCount, number, ...args }: TransferMoveConstructorArgs) {
    super({ allowedPlayer, deskCardCount, number });
    this.card = args.card;
    this.slotIndex = args.deskIndex;
  }
}