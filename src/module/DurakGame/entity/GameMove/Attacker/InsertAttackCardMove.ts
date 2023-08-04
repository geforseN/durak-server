import { AttackerMove } from "./AttackerMove";
import { type AfterHandler } from "../GameMove.abstract";
import type Card from "../../Card";
import type DurakGame from "../../../DurakGame";
import { CardInsert } from "../../GameRound/CardInsert.interface";

export class InsertAttackCardMove
  extends AttackerMove
  implements AfterHandler, CardInsert
{
  card: Card;
  slotIndex: number;

  constructor(
    game: DurakGame,
    {
      card: cardToRemove,
      slotIndex,
    }: {
      card: Card;
      slotIndex: number;
    },
  ) {
    super(game, { performer: game.players.attacker });
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
    if (
      this.player.hand.isEmpty ||
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
