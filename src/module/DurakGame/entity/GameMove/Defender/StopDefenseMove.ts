import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";
import { DefenderGaveUpMove } from "./DefenderGaveUpMove";
import assert from "node:assert";

export class StopDefenseMove extends DefenderMove implements AfterHandler {
  handleAfterMoveIsDone(): void {
    if (this.game.desk.isDefended) {
      return this.game.round.giveAttackTo(this.game.round.primalAttacker);
    }
    assert.ok(this.player.isDefender());
    return this.updateTo(DefenderGaveUpMove, this.player, {});
  }
}
