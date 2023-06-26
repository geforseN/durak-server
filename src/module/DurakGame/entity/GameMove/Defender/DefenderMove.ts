import Defender from "../../Player/Defender";
import { GameMove } from "../GameMove.abstract";
import Card from "../../Card";
import DurakGame from "../../../DurakGame.implimetntation";

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

  override async putCardOnDesk(card: Card, slotIndex: number) {
    await this.game.desk.slots[slotIndex].ensureCanBeDefended({ card });
    this.game.round.makeDefendInsertMove(card, slotIndex);
  }

  override stopMove() {
    this.game.round.makeDefendStopMove();
  }

  async allowsTransferMove(card: Card, slotIndex: number) {
    return (
      this.player.left.canTakeMore({ cardCount: this.game.desk.cardCount }) &&
      this.game.desk.allowsTransferMove(card, slotIndex)
    );
  }
}
