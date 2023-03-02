import { DefenderMove, DefenderMoveConstructorArgs } from "./DefenderMove";
import Card from "../Card";

type InsertDefendCardMoveConstructorArgs = { card: Card, slotIndex: number } & DefenderMoveConstructorArgs;

export class InsertDefendCardMove extends DefenderMove {
  card: Card;
  slotIndex: number;

  constructor({ number, allowedPlayer, deskCardCount, ...args }: InsertDefendCardMoveConstructorArgs) {
    super({ number, allowedPlayer, deskCardCount });
    this.slotIndex = args.slotIndex;
    this.card = args.card;
  }
}