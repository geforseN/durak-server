import { lobbiesNamespace, lobbiesService, lobbies, durakGames } from "../../../index";
import { LobbiesIO } from "../lobbies.types";
import assert from "node:assert";
import DurakGame from "../../../module/DurakGame/DurakGame.implimetntation";

export default function createGame(
  this: { socket: LobbiesIO.SocketIO },
  accname: string,
  lobbyId: string,
) {
  try {
    const lobby = lobbies.tryFindLobby({ id: lobbyId })!;
    const isEmitFromAdmin = lobby.adminAccname === accname;
    assert.ok(isEmitFromAdmin, "Нет доступа");
    const game = new DurakGame(lobby);
    durakGames.set(`/game/${lobby.id}`, game);
    lobbiesNamespace.to(lobby.id).emit("startGame", game.info.id);
    lobbies.deleteLobbyById({ id: lobbyId });
  } catch (error) {
    lobbiesService.handleError({ name: "CreateGameError", error, socket: this.socket });
  }
}