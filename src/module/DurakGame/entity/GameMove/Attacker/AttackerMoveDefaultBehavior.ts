import assert from "node:assert";
import Attacker from "../../Player/Attacker";
import { AttackerMove } from "./AttackerMove";
import DefaultBehavior from "../DefaultBehavior";

export class AttackerMoveDefaultBehavior extends DefaultBehavior<AttackerMove /* TODO specify move type*/> {
  value: NodeJS.Timeout;

  constructor(move: AttackerMove) {
    super(move);
    this.value = setTimeout(async () => {
      if (!this.shouldBeCalled) return;
      console.log("TIMEOUT: defaultBehavior ATTACKER called");
      assert.ok(
        this.move.player instanceof Attacker,
        "TIMEOUT: defaultBehavior BUG",
      );
      console.log("TIMEOUT: ATTACKER insertRandomCard");
      await this.move.player.putCardOnDesk(
        this.move,
        this.move.player.randomCard,
        this.move.game.desk.randomEmptySlotIndex,
      );
    }, this.move.game.settings.moveTime);
  }
}
