import Defender from "../../Player/Defender";
import assert from "node:assert";
import DefenderMove from "./DefenderMove";

export class DefenderMoveDefaultBehavior {
  #value;
  callTimeInUTC;
  #move;
  shouldBeCalled;
  constructor(move: DefenderMove) {
    this.#move = move;
    this.callTimeInUTC = Date.now() + move.game.settings.moveTime;
    this.#value = this.#_value_;
    this.shouldBeCalled = true;
  }

  get #_value_() {
    return setTimeout(async () => {
      if (!this.shouldBeCalled) return;
      console.log("TIMEOUT: defaultBehavior DEFENDER called");
      assert.ok(
        this.#move.player instanceof Defender,
        "TIMEOUT: defaultBehavior DEFENDER BUG",
      );
      console.log("TIMEOUT: DEFENDER stopMove");
      this.#move.player.stopMove(this.#move);
    }, this.#move.game.settings.moveTime);
  }

  stop() {
    clearTimeout(this.#value);
  }
}
