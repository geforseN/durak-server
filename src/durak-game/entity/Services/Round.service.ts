import Player from "../Players/Player";
import { GamesIO } from "../../../namespaces/games/games.types";

export default class GameRoundService {
  constructor(
    private namespace: GamesIO.NamespaceIO,
  ) {
  }

  letMoveTo(player: Player) {
    this.namespace.emit("player__allowedToMove", player.id);
  }
}