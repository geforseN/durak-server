import { DefenderMove } from "./DefenderMove";
import { AfterHandler } from "../../GameRound";

export class StopDefenseMove extends DefenderMove implements AfterHandler {
  handleAfterMoveIsDone() {
    if (!this.game.desk.isDefended) {
      this.game.round.makeDefenderLost();
    }
    return this.game.round.givePrimalAttackerAttack();
  }
}
