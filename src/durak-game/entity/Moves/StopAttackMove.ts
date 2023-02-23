import Attacker from "../Players/Attacker";
import { AttackerMove } from "./AttackerMove";
import { GameMoveConstructorArgs } from "./GameMove";

type StopAttackMoveConstructorArgs = GameMoveConstructorArgs<Attacker> & { deskCardCount: number }

export class StopAttackMove extends AttackerMove {
  constructor({ number, allowedPlayer, deskCardCount }: StopAttackMoveConstructorArgs) {
    super({ number, allowedPlayer, deskCardCount });
  }
}