import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";
import FailedDefense from "../../DefenseEnding/FailedDefense";
import type DurakGame from "../../../DurakGame";

export class DefenderGaveUpMove extends DefenderMove implements AfterHandler {
  constructor(game: DurakGame) {
    super(game);
    this.performer.isGaveUp = true;
  }

  handleAfterMoveIsDone() {
    if (!this.game.desk.allowsMoves) {
      return this.game.round.endWith(FailedDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.primalAttacker);
  }
}
