import GameMove from "../GameMove.abstract";
import type Defender from "../../Player/Defender";
import type DurakGame from "../../../DurakGame.implimetntation";
import type Card from "../../Card";

export class DefenderMove extends GameMove<Defender> {
  defaultBehaviour: NodeJS.Timeout;
  defaultBehaviourCallTimeInUTC: number;

  constructor(arg: { game: DurakGame; player: Defender }) {
    super(arg);
    this.defaultBehaviourCallTimeInUTC =
      Date.now() + this.game.settings.moveTime;
    this.defaultBehaviour = this.#defaultBehaviour();
  }

  #defaultBehaviour(): NodeJS.Timeout {
    return setTimeout(() => {
      this.stopMove();
    }, this.game.settings.moveTime);
  }

  async putCardOnDesk(card: Card, slotIndex: number) {
    if (await this.game.round.currentMove.allowsTransferMove(card, slotIndex)) {
      this.game.round.makeTransferMove(card, slotIndex);
    } else {
      await this.game.desk.slotAt(slotIndex)?.ensureCanBeDefended(card);
      this.game.round.makeDefendInsertMove(card, slotIndex);
    }
  }

  stopMove() {
    this.game.round.makeDefendStopMove();
  }

  async allowsTransferMove(card: Card, slotIndex: number) {
    return (
      this.player.left.canTakeMore(this.game.desk.cardsCount) &&
      this.game.desk.allowsTransferMove(card, slotIndex)
    );
  }
}
export default DefenderMove;
