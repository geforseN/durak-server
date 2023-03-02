import { AttackerMove, AttackerMoveConstructorArgs } from "./AttackerMove";

export class StopAttackMove extends AttackerMove {
  constructor({ number, allowedPlayer, deskCardCount }: AttackerMoveConstructorArgs) {
    super({ number, allowedPlayer, deskCardCount });
  }
}