import Player from "../Players/Player";
import { GamesIO } from "../../../namespaces/games/games.types";

export default class GameRoundService {
  constructor(
    private namespace: GamesIO.NamespaceIO,
  ) {
  }

  letMoveTo(player: Player, timeEnd: number) {
    this.namespace.emit("player__allowedToMove", player.id, timeEnd);
  }

  emitDefenderGaveUp() {
    this.namespace.emit("defender__gaveUp");
  }
}