import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";

export class StopDefenseMove extends DefenderMove implements AfterHandler {
  //REVIEW - logic of method could have changed
  handleAfterMoveIsDone() {
    if (this.game.desk.isDefended) {
      return this.game.round.givePrimalAttackerAttack();
    }
    return this.game.round.makeDefenderLost();
  }
}
