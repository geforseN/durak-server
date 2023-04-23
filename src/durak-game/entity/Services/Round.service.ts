import Player from "../Players/Player";
import { GamesIO } from "../../../namespaces/games/games.types";
import UIService from "./UI.service";

export default class GameRoundService {
  constructor(
    private namespace: GamesIO.NamespaceIO,
    public ui = new UIService(namespace)
  ) {
  }

  letMoveTo(player: Player) {
    this.namespace.emit("player__allowedToMove", player.id);
  }
}