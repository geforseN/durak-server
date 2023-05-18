import Player from "../Players/Player";
import { GamesIO } from "../../../namespaces/games/games.types";

export default class GameRoundService {
  constructor(
    private namespace: GamesIO.NamespaceIO,
  ) {
  }

  letMoveTo(player: Player, timeEnd: number, moveTime: number) {
    this.namespace.emit("player__allowedToMove", player.id, timeEnd, moveTime / 1000);
  }

  emitDefenderGaveUp() {
    this.namespace.emit("defender__gaveUp");
  }
}