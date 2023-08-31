import type DurakGame from "../../DurakGame";
import { FailedDefense } from "../DefenseEnding";
import type AllowedToMoveDefender from "../Player/AllowedToMoveDefender";
import { DefenderMoveDefaultBehavior } from "./DefaultBehavior/DefenderMoveDefaultBehavior";
import GameMove, { AfterHandler } from "./GameMove.abstract";

export default class DefenderGaveUpMove
  extends GameMove<AllowedToMoveDefender>
  implements AfterHandler
{
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(game: DurakGame, performer: AllowedToMoveDefender) {
    super(game, performer);
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return false;
  }

  override isInsertMove(): boolean {
    return false;
  }

  handleAfterMoveIsDone() {
    if (!this.game.desk.allowsMoves) {
      return this.game.round.endWith(FailedDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.primalAttacker);
  }
}
