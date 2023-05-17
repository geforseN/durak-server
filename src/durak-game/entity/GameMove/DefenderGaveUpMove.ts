import { DefenderMove } from "./DefenderMove";

export class DefenderGaveUpMove extends DefenderMove {
  handleAfterGaveUp() {
    return this.game.desk.allowsMoves
      ? this.game.round.givePrimalAttackerAttack()
      : this.game.handleLostDefence(this.player);
  }
}