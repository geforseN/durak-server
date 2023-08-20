import Defender from "../../Player/Defender";
import assert from "node:assert";
import DefenderMove from "./DefenderMove";
import DefaultBehavior from "../DefaultBehavior";

export class DefenderMoveDefaultBehavior extends DefaultBehavior<DefenderMove /* TODO specify move type*/> {
  value;

  constructor(move: DefenderMove, shouldBeCalled = true) {
    super(move);
    this.value = setTimeout(async () => {
      if (!this.shouldBeCalled) return;
      console.log("TIMEOUT: defaultBehavior DEFENDER called");
      assert.ok(
        this.move.player instanceof Defender,
        "TIMEOUT: defaultBehavior DEFENDER BUG",
      );
      console.log("TIMEOUT: DEFENDER stopMove");
      this.move.player.stopMove(move.game.round);
    }, this.move.game.settings.moveTime);
  }
}
