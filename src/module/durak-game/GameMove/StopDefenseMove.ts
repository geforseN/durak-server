import { DefenderMove } from "./DefenderMove";
import { AfterHandler } from "../entity/GameRound";

export class StopDefenseMove extends DefenderMove implements AfterHandler{
  handleAfterInitialization() {
    if (!this.game.desk.isDefended) {
      this.game.round.makeDefenderLost();
    }
    return this.game.round.givePrimalAttackerAttack();
  }
}