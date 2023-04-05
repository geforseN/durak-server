import { AttackerMove, AttackerMoveConstructorArgs } from "./AttackerMove";

export class StopAttackMove extends AttackerMove {
  constructor({ player, deskCardCount }: AttackerMoveConstructorArgs) {
    super({ player, deskCardCount });
  }
}