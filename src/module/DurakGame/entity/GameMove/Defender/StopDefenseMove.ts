import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";
import { DefenderGaveUpMove } from "./DefenderGaveUpMove";

export class StopDefenseMove extends DefenderMove implements AfterHandler {
  handleAfterMoveIsDone(): void {
    if (this.game.desk.isDefended) {
      return this.game.round.giveAttackTo(this.game.round.primalAttacker);
    }
    return this.updateTo(DefenderGaveUpMove);
  }
}
