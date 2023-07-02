import { AttackerMove } from "./AttackerMove";
import { AfterHandler } from "../../GameRound";

export class StopAttackMove extends AttackerMove implements AfterHandler {
  handleAfterMoveIsDone() {
    if (this.game.round.isDefenderGaveUp) {
      return this.#handleInPursuit();
    }
    debugger;
    if (this.player.hasPutLastCard(this.game.round)) {
      return this.game.round.giveDefenderDefend();
    }
    if (this.game.players.defender.canWinDefense(this.game)) {
      return this.game.handleWonDefence(this.game.players.defender);
    }
    return this.game.round.giveNextAttackerAttack();
  }

  #handleInPursuit() {
    const { primalAttacker } = this.game.round;
    if (
      this.player.left === primalAttacker ||
      this.game.players.defender.left === primalAttacker
    ) {
      return this.game.handleLostDefence(this.game.players.defender);
    }
    return this.game.round.giveNextAttackerAttack();
  }
}
