import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";

export class DefenderGaveUpMove extends DefenderMove implements AfterHandler {
  handleAfterMoveIsDone() {
    return this.game.desk.allowsMoves
      ? this.game.round.givePrimalAttackerAttack()
      : this.game.handleLostDefence();
  }
}