import Player from "../Player/Player";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";

export default class GameRoundService {
  constructor(private namespace: DurakGameSocket.Namespace) {
  }

  letMoveTo(player: Player, timeEnd: number, moveTime: number) {
    this.namespace.emit("player__allowedToMove", player.id, timeEnd, moveTime / 1000);
  }

  emitDefenderGaveUp() {
    this.namespace.emit("defender__gaveUp");
  }
}