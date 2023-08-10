import DefenderMove from "./DefenderMove";
import { type AfterHandler } from "../GameMove.abstract";
import type Card from "../../Card";
import SuccessfulDefense from "../../DefenseEnding/SuccessfulDefense";
import { type CardInsert } from "../../GameRound/CardInsert.interface";
import type DurakGame from "../../../DurakGame";

export class InsertDefendCardMove
  extends DefenderMove
  implements AfterHandler, CardInsert
{
  card: Card;
  slotIndex: number;

  constructor(
    game: DurakGame,
    { card: cardToRemove, slotIndex }: { card: Card; slotIndex: number },
  ) {
    super(game, { performer: game.players.defender });
    this.card = this.performer.remove((card) => card === cardToRemove);
    this.slotIndex = slotIndex;
    this.isInsertMove = true;
    this.game.desk.receiveCard({
      card: this.card,
      index: this.slotIndex,
      source: this.performer,
    });
  }

  handleAfterMoveIsDone() {
    if (!this.game.desk.isDefended) {
      return this.game.round.giveDefendTo(this.game.players.defender);
    }
    if (this.player.hand.isEmpty || !this.game.desk.allowsMoves) {
      return this.game.round.endWith(SuccessfulDefense);
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.game.round.giveAttackTo(this.game.round.primalAttacker);
    }
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.game.round.giveDefendTo(this.game.players.defender);
  }
}
