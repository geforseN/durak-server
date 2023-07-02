import Player, { PlayerKind, playerKinds } from "../Player/Player";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import assert from "assert";

export default class GamePlayersManagerService {
  constructor(
    public namespace: DurakGameSocket.Namespace,
  ) {
  }

  changeKind(kind: string, player: Player) {
    assertPlayerKind(kind);
    this.namespace.emit("player__changeKind", kind, player.id);
  }

  exitGame(player: Player) {
    this.namespace.emit("player__exitGame", player.id)
  }
}

export function assertPlayerKind(kind: string): asserts kind is PlayerKind {
  assert.ok(playerKinds.includes(kind as PlayerKind));
}
