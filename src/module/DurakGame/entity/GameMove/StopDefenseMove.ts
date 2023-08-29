import type DurakGame from "../../DurakGame";
import type AllowedToMoveDefender from "../Player/AllowedToMoveDefender";
import { DefenderMoveDefaultBehavior } from "./DefaultBehavior/DefenderMoveDefaultBehavior";
import DefenderGaveUpMove from "./DefenderGaveUpMove";
import GameMove, { type AfterHandler } from "./GameMove.abstract";

export default class StopDefenseMove
  extends GameMove<AllowedToMoveDefender>
  implements AfterHandler
{
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(game: DurakGame, performer: AllowedToMoveDefender) {
    super(game, performer);
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }

  isInsertMove(): boolean {
    return false;
  }

  isBaseMove(): boolean {
    return false;
  }

  handleAfterMoveIsDone() {
    if (this.game.desk.isDefended) {
      return this.game.round.giveAttackTo(this.game.round.primalAttacker);
    }
    return new DefenderGaveUpMove(
      this.game,
      this.performer.asSurrenderedDefender().asAllowedToMakeMove(this.game),
    );
  }
}
