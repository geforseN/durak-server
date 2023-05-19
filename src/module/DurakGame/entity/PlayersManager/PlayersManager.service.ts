import Player, { PlayerKind } from "../Player/Player";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";

export default class GamePlayersManagerService {
  constructor(
    public namespace: DurakGameSocket.Namespace,
  ) {
  }

  changeKind(kind: PlayerKind, player: Player) {
    this.namespace.emit("player__changeKind", kind, player.info.accname);
  }

  exitGame(player: Player) {
    this.namespace.emit("player__exitGame", player.id)
  }
}