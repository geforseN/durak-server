import { AttackerMove } from "./AttackerMove";
import Card from "../Card";
import Attacker from "../Players/Attacker";
import { GameMoveConstructorArgs } from "./GameMove";

type InsertAttackCardMoveConstructorArgs = { slotIndex: number, card: Card } & GameMoveConstructorArgs<Attacker>

export class InsertAttackCardMove extends AttackerMove {
  card: Card;
  slotIndex: number;

  constructor({ number, allowedPlayer, deskCardCount, ...args }: InsertAttackCardMoveConstructorArgs) {
    super({ number, allowedPlayer, deskCardCount });
    this.slotIndex = args.slotIndex;
    this.card = args.card;
  }
}