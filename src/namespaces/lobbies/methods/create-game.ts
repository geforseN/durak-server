import { lobbiesNamespace, lobbiesService, lobbies, durakGames } from "../../../index";
import { LobbiesIO } from "../lobbies.types";
import DurakGame from "../../../module/durak-game";

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
    durakGames.set(lobbyId, game);
    lobbiesNamespace.to(lobby.id).emit("startGame", game.id);
    lobbies.deleteLobbyById({id: lobbyId})
  } catch (error) {
    lobbiesService.handleError({ name: "CreateGameError", error, socket: this.socket  });
  }
}