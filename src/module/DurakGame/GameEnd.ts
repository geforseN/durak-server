import { durakGames } from "../..";
import type DurakGame from "./DurakGame.implimetntation";

export class GameEnd {
  constructor(private game: DurakGame) {}

  handle() {
    const [durak] = this.game.players;
    this.game.info.durakId = durak.id;
    this.game.info.namespace.emit("game__over");
    durakGames.delete(this.game.info.id);
  }
}
