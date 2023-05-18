import Player from "../Players/Player";
import { GamesIO, PlayerRole } from "../../../namespaces/games/games.types";

export default class GamePlayersManagerService {
  constructor(
    public namespace: GamesIO.NamespaceIO,
  ) {
  }

  changeRole(role: PlayerRole, player: Player) {
    this.namespace.emit("player__changeRole", role, player.info.accname);
  }

  /** @TODO */
  removeFromGame(player: Player) {

  }
}