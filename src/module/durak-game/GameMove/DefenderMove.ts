import Defender from "../Players/Defender";
import { GameMove } from "./GameMove";
import Card from "../entity/Card";
import DurakGame from "../DurakGame";

export class DefenderMove extends GameMove<Defender> {
  defaultBehaviour: NodeJS.Timeout;

  constructor(arg: { game: DurakGame, player: Defender }) {
    super(arg);
    this.defaultBehaviour = this.#defaultBehaviour();
  }

  #defaultBehaviour(): NodeJS.Timeout {
    return setTimeout(() => {
      this.stopMove();
    }, this.game.settings.moveTime);
  }

  override async putCardOnDesk(card: Card, slotIndex: number) {
    await this.game.desk
      .getSlot({ index: slotIndex })
      .assertCanBeDefended({ card });
    this.game.round.makeDefendInsertMove(card, slotIndex);
  }

  override stopMove() {
    this.game.round.makeDefendStopMove();
  }
}