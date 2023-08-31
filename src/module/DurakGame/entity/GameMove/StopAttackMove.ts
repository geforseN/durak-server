import FailedDefense from "../DefenseEnding/FailedDefense";
import SuccessfulDefense from "../DefenseEnding/SuccessfulDefense";
import GameMove, { CardInsert, type AfterHandler } from "./GameMove.abstract";
import AllowedToMoveAttacker from "../Player/AllowedToMoveAttacker";
import { AttackerMoveDefaultBehavior } from "./DefaultBehavior/AttackerMoveDefaultBehavior";
import DurakGame from "../../DurakGame";

export default class StopAttackMove
  extends GameMove<AllowedToMoveAttacker>
  implements AfterHandler
{
  defaultBehavior: AttackerMoveDefaultBehavior;

  constructor(game: DurakGame, performer: AllowedToMoveAttacker) {
    super(game, performer);
    this.defaultBehavior = new AttackerMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return false;
  }

  override isInsertMove(): this is CardInsert {
    return false;
  }

  handleAfterMoveIsDone() {
    if (this.game.players.defender.isSurrendered) {
      return this.#handleInPursuit();
    }
    if (this.performer.hasPutLastCard(this.game.round)) {
      return this.game.round.giveDefendTo(this.game.players.defender);
    }
    if (this.game.players.defender.canWinDefense(this.game.round)) {
      return this.game.round.endWith(SuccessfulDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.nextAttacker);
  }

  #handleInPursuit() {
    if (
      this.performer.left === this.game.round.primalAttacker ||
      this.game.players.defender.left === this.game.round.primalAttacker
    ) {
      return this.game.round.endWith(FailedDefense);
    }
    return this.game.round.giveAttackTo(this.game.round.nextAttacker);
  }
}
