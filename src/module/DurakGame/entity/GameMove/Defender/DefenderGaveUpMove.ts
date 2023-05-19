import { DefenderMove } from "./DefenderMove";
import { AfterHandler } from "../../GameRound";

export class DefenderGaveUpMove extends DefenderMove implements AfterHandler {
  handleAfterInitialization() {
    return this.game.desk.allowsMoves
      ? this.game.round.givePrimalAttackerAttack()
      : this.game.handleLostDefence(this.player);
  }
}