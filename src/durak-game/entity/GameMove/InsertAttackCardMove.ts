import { AttackerMove, AttackerMoveConstructorArgs } from "./AttackerMove";
import Card from "../Card";

type InsertAttackCardMoveConstructorArgs = { card: Card, slotIndex: number } & AttackerMoveConstructorArgs;

export class InsertAttackCardMove extends AttackerMove {
  card: Card;
  slotIndex: number;

  constructor({ player, deskCardCount, ...args }: InsertAttackCardMoveConstructorArgs) {
    super({ player, deskCardCount });
    this.slotIndex = args.slotIndex;
    this.card = args.card;
  }
}