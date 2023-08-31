import GameMove, {
  type CardInsert,
  type AfterHandler,
} from "./GameMove.abstract";
import type Card from "../Card";
import type DurakGame from "../../DurakGame";
import AllowedToMoveAttacker from "../Player/AllowedToMoveAttacker";
import { AttackerMoveDefaultBehavior } from "./DefaultBehavior/AttackerMoveDefaultBehavior";

export default class InsertAttackCardMove
  extends GameMove<AllowedToMoveAttacker>
  implements AfterHandler, CardInsert
{
  defaultBehavior: AttackerMoveDefaultBehavior;

  constructor(
    game: DurakGame,
    performer: AllowedToMoveAttacker,
    {
      card,
      slotIndex,
    }: {
      card: Card;
      slotIndex: number;
    },
  ) {
    super(game, performer);
    this.defaultBehavior = new AttackerMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return false;
  }

  override isInsertMove(): this is CardInsert {
    return true;
  }

  handleAfterMoveIsDone() {
    if (
      this.performer.hand.isEmpty ||
      !this.game.players.defender.canDefend(
        this.game.desk.unbeatenSlots.cardCount,
      ) ||
      !this.game.desk.allowsAttackerMove
    ) {
      return this.game.round.giveDefendTo(this.game.players.defender);
    }
    return this.game.round.giveAttackTo(this.game.players.attacker);
  }
}
