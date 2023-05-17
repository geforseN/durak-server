import Defender from "../Players/Defender";
import { GameMove } from "./GameMove";
import Card from "../Card";
import DurakGame from "../../DurakGame";

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

  async putCardOnDesk(card: Card, slotIndex: number) {
    const slot = this.game.desk.getSlot({ index: slotIndex });
    await slot.assertCanBeDefended({ card });
    this.player.remove({ card });
    this.game.round.makeDefendInsertMove(card, slotIndex);
  }

  override stopMove() {
    this.game.round.makeDefendStopMove();
  }
}