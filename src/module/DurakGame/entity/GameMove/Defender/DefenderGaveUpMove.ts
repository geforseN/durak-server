import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";
import { FailedDefence } from "../../../FailedDefence";

export class DefenderGaveUpMove extends DefenderMove implements AfterHandler {
  handleAfterMoveIsDone() {
    return this.game.desk.allowsMoves
      ? this.game.round.givePrimalAttackerAttack()
      : new FailedDefence(this.game).pushNewRound();
  }
}