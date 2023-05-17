import { DefenderMove } from "./DefenderMove";

export class StopDefenseMove extends DefenderMove {
  handleAfterStopMove() {
    if (!this.game.desk.isDefended) {
      this.game.round.makeDefenderLost();
    }
    return this.game.round.givePrimalAttackerAttack();
  }
}