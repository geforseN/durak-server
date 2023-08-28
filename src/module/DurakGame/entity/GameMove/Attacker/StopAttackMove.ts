import assert from "node:assert";
import FailedDefense from "../../DefenseEnding/FailedDefense";
import SuccessfulDefense from "../../DefenseEnding/SuccessfulDefense";
import { Attacker } from "../../Player";
import { type AfterHandler } from "../GameMove.abstract";
import AttackerMove from "./AttackerMove";

export class StopAttackMove extends AttackerMove implements AfterHandler {
  handleAfterMoveIsDone() {
    assert.ok(this.player.isAttacker());
    if (this.game.players.defender.isGaveUp) {
      return this.#handleInPursuit();
    }
    if (this.player.hasPutLastCard(this.game.round)) {
      return this.game.round.giveDefendTo(this.game.players.defender);
    }
    if (this.game.players.defender.canWinDefense(this.game.round)) {
      return this.game.round.endWith(SuccessfulDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.nextAttacker);
  }

  #handleInPursuit() {
    if (
      this.player.left === this.game.round.primalAttacker ||
      this.game.players.defender.left === this.game.round.primalAttacker
    ) {
      return this.game.round.endWith(FailedDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.nextAttacker);
  }
}
