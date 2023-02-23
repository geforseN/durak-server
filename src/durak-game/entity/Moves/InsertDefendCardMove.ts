import { DefenderMove, DefenderMoveConstructorArgs } from "./DefenderMove";

export class InsertDefendCardMove extends DefenderMove {
  constructor({ number, allowedPlayer, deskCardCount }: DefenderMoveConstructorArgs) {
    super({ number, allowedPlayer, deskCardCount });
  }
}