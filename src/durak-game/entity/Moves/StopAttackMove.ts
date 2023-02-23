import Attacker from "../Players/Attacker";
import { AttackerMove } from "./AttackerMove";
import { GameMoveConstructorArgs } from "./GameMove";

type StopAttackMoveConstructorArgs = GameMoveConstructorArgs<Attacker> & { deskCardCount: number }

export class StopAttackMove extends AttackerMove {
  deskCardCount: number;

  constructor({ number, allowedPlayer, ...args }: StopAttackMoveConstructorArgs) {
    super({ number, allowedPlayer });
    this.deskCardCount = args.deskCardCount;
  }
}