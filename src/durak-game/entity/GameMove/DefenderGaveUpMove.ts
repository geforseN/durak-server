import { DefenderMove, DefenderMoveConstructorArgs } from "./DefenderMove";

export class DefenderGaveUpMove extends DefenderMove {
  constructor({ player, deskCardCount }: DefenderMoveConstructorArgs) {
    super({ player, deskCardCount });
  }
}