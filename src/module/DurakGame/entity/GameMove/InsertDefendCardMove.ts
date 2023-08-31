import GameMove, { AfterHandler, CardInsert } from "./GameMove.abstract";
import AllowedToMoveDefender from "../Player/AllowedToMoveDefender";
import { DefenderMoveDefaultBehavior } from "./DefaultBehavior/DefenderMoveDefaultBehavior";
import Card from "../Card";
import DurakGame from "../../DurakGame";
import { SuccessfulDefense } from "../DefenseEnding";

export default class InsertDefendCardMove
  extends GameMove<AllowedToMoveDefender>
  implements AfterHandler, CardInsert
{
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(
    game: DurakGame,
    performer: AllowedToMoveDefender,
    { card, slotIndex }: { card: Card; slotIndex: number },
  ) {
    super(game, performer);
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return false;
  }

  override isInsertMove(): this is CardInsert {
    return true;
  }

  handleAfterMoveIsDone() {
    if (!this.game.desk.isDefended) {
      return this.game.round.giveDefendTo(this.game.players.defender);
    }
    if (this.performer.hand.isEmpty || !this.game.desk.allowsMoves) {
      return this.game.round.endWith(SuccessfulDefense);
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.game.round.giveAttackTo(this.game.round.primalAttacker);
    }
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.game.round.giveDefendTo(this.game.players.defender);
  }
}
