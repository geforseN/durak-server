import Defender from "../Players/Defender";
import { GameMove } from "./GameMove";

export class DefenderMove extends GameMove<Defender> {
  get defaultBehaviour(): NodeJS.Timeout {
    return setTimeout(() => {
      this.player.stopMove({ game: this.game });
    });
  }
}