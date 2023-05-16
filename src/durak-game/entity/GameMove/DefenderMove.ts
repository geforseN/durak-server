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
      this.player.stopMove({ game: this.game });
    }, this.game.settings.moveTime);
  }
}