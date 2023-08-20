import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";
import FailedDefense from "../../DefenseEnding/FailedDefense";

export class DefenderGaveUpMove extends DefenderMove implements AfterHandler {
  // TODO in ctor: this.game.players.defender.isGaveUp = true

  handleAfterMoveIsDone() {
    if (!this.game.desk.allowsMoves) {
      return this.game.round.endWith(FailedDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.primalAttacker);
  }
}
