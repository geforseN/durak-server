import type DurakGame from "../../../DurakGame";
import type Card from "../../Card";
import { type CardInsert } from "../../GameRound/CardInsert.interface";
import { type AfterHandler } from "../GameMove.abstract";
import DefenderMove from "./DefenderMove";

export class TransferMove
  extends DefenderMove
  implements AfterHandler, CardInsert
{
  card: Card;
  slotIndex: number;

  constructor(
    game: DurakGame,
    context: {
      card: Card;
      slotIndex: number;
    },
  ) {
    super(game, { performer: game.players.defender });
    this.card = this.performer.remove((card) => card === context.card);
    this.slotIndex = context.slotIndex;
    this.isInsertMove = true;
    this.game.desk.receiveCard({
      card: this.card,
      index: this.slotIndex,
      source: this.performer,
    });
  }

  // TODO: fix hard to catch bug in this.#defaultBehavior
  // should be this.#defaultBehavior redefined
  // when this.player become Attacker (code line below)
  // or should just clearInterval(this.defaultBehavior)
  handleAfterMoveIsDone() {
    this.game.players.attacker = this.performer;
    return this.game.round.giveDefendTo(this.player.left);
  }
}
