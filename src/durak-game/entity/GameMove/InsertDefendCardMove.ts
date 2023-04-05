import { DefenderMove, DefenderMoveConstructorArgs } from "./DefenderMove";
import Card from "../Card";

type InsertDefendCardMoveConstructorArgs = { card: Card, slotIndex: number } & DefenderMoveConstructorArgs;

export class InsertDefendCardMove extends DefenderMove {
  card: Card;
  slotIndex: number;

  constructor({ player, deskCardCount, ...args }: InsertDefendCardMoveConstructorArgs) {
    super({ player, deskCardCount });
    this.slotIndex = args.slotIndex;
    this.card = args.card;
  }
}