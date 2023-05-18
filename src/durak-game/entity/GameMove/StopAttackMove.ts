import { AttackerMove } from "./AttackerMove";
import { AfterHandler } from "../GameRound";

export class StopAttackMove extends AttackerMove implements AfterHandler {
  handleAfterInitialization() {
    if (this.game.round.isDefenderGaveUp) {
      return this.#handleInPursuit();
    }
    if (this.player.hasPutLastCard({ round: this.game.round })) {
      return this.game.round.giveDefenderDefend();
    }
    if (this.game.players.defender.canWinDefense({ game: this.game })) {
      return this.game.handleWonDefence(this.game.players.defender);
    }
    return this.game.round.giveNextAttackerAttack();
  }

  #handleInPursuit() {
    if (this.player.left.isPrimalAttacker({ round: this.game.round })
      || this.game.players.defender.left.isPrimalAttacker({ round: this.game.round })
    ) {
      return this.game.handleLostDefence(this.game.players.defender);
    }
    return this.game.round.giveNextAttackerAttack();
  }
}