import { gameLobbies } from "../../../index";
import DB from "../../../db";
import { lobbies } from "../game-lobbies.handler";
import { GameLobbiesIO } from "../game-lobbies.types";
import tryAuth from "../../../checkers/try-auth";
import handleUserAlreadyInLobby from "./handle-user-already-in-lobby";
import userMatcher from "../../../db/user.matcher";
import Lobby from "../lobby";
import NotificationAlert from "../../../module/notification-alert";

export default function joinLobby(
  this: { socket: GameLobbiesIO.SocketIO },
  lobbyId: string,
  _cellIndex: number,
) {
  try {
    const { accName } = tryAuth(this.socket).data;
    const lobby = tryFindLobby(lobbyId);

    lobby.ensureCanJoinLobby();

    ensureUserAlreadyInLobby(lobby, accName!);

    handleUserAlreadyInLobby(accName!);

    const user = DB.User.findByAccNameOrThrow(accName!);

    lobby.addUser(user);
    gameLobbies.emit("addedUser", user, lobby.id);
  } catch (error) {
    if (error instanceof Error) {
      const notification = new NotificationAlert().fromError(error);
      gameLobbies.to(this.socket.id).emit("sendNotification", notification);
    } else {
      console.log("GlobalChat Error:", error);
    }
  }
}

// Lobby: this.users.ensureAlreadyInLobby(accName)
function ensureUserAlreadyInLobby(lobby: Lobby, accName: string): void | never {
  const userIndex = lobby.users.findIndex(userMatcher, { accName });
  if (userIndex !== -1) throw new Error("Вы находитесь в этом лобби");
}

// in Lobbies class
function tryFindLobby(lobbyId: string): Lobby | never {
  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) throw new Error("Лобби не найдено");
  return lobby;
}
