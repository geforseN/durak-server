import Defender from "../Players/Defender";
import { GameMove } from "./GameMove";

export class DefenderMove extends GameMove<Defender> {
  defaultBehaviour: NodeJS.Timeout = this.#defaultBehaviour();

  #defaultBehaviour(): NodeJS.Timeout {
    return setTimeout(() => {
      this.player.stopMove({ game: this.game });
    }, this.game.settings.moveTime);
  }
}