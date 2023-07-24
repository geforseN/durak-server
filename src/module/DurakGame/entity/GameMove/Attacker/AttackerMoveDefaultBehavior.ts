import assert from "node:assert";
import Attacker from "../../Player/Attacker";
import { AttackerMove } from "./AttackerMove";

export class AttackerMoveDefaultBehavior {
  #value;
  callTimeInUTC;
  #move;
  shouldBeCalled;

  constructor(move: AttackerMove) {
    this.#move = move;
    this.callTimeInUTC = Date.now() + move.game.settings.moveTime;
    this.#value = this.#_value_;
    this.shouldBeCalled = true;
  }

  get #_value_() {
    return setTimeout(async () => {
      if (!this.shouldBeCalled) return;
      console.log("TIMEOUT: defaultBehaviour ATTACKER called");
      assert.ok(
        this.#move.player instanceof Attacker,
        "TIMEOUT: defaultBehaviour BUG",
      );
      console.log("TIMEOUT: ATTACKER insertRandomCard");
      await this.#move.player.putCardOnDesk(
        this.#move,
        this.#move.player.randomCard,
        this.#move.game.desk.randomEmptySlotIndex,
      );
    }, this.#move.game.settings.moveTime);
  }

  stop() {
    clearTimeout(this.#value);
  }
}
