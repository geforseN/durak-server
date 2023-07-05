import assert from "node:assert";
import AttackerMove from "./AttackerMove";
import { Attacker } from "../../Player";
import { type AfterHandler } from "../GameMove.abstract";

export class StopAttackMove extends AttackerMove implements AfterHandler {
  handleAfterMoveIsDone() {
    assert.ok(this.player instanceof Attacker);
    if (this.game.round.isDefenderGaveUp) {
      return this.#handleInPursuit();
    }
    if (this.player.hasPutLastCard(this.game.round)) {
      return this.game.round.giveDefenderDefend();
    }
    if (this.game.players.defender.canWinDefense(this.game)) {
      return this.game.handleSuccessfulDefence();
    }
    return this.game.round.giveNextAttackerAttack();
  }

  #handleInPursuit() {
    const { primalAttacker } = this.game.round;
    if (
      this.player.left === primalAttacker ||
      this.game.players.defender.left === primalAttacker
    ) {
      return this.game.handleFailedDefence();
    }
    return this.game.round.giveNextAttackerAttack();
  }
}
