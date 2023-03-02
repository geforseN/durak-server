import { lobbiesNamespace, lobbiesService, lobbies, durakGames } from "../../../index";
import { LobbiesIO } from "../lobbies.types";
import DurakGame from "../../../durak-game/DurakGame";

export default function createGame(
  this: { socket: LobbiesIO.SocketIO },
  accname: string,
  lobbyId: string,
) {
  try {
    const lobby = lobbies.tryFindLobby({ id: lobbyId })!;

    const isEmitFromAdmin = lobby.adminAccname === accname;
    if (!isEmitFromAdmin) throw Error("Нет доступа");

    const game = new DurakGame(lobby);
    durakGames.set(`/game/${lobby.id}`, game);
    lobbiesNamespace.to(lobby.id).emit("startGame", game.info.id);
    lobbies.deleteLobbyById({ id: lobbyId });
  } catch (error) {
    lobbiesService.handleError({ name: "CreateGameError", error, socket: this.socket });
  }
}