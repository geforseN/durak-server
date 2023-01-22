import { gameLobbies } from "../../../index";
import { lobbies } from "../game-lobbies.handler";
import { GameLobbiesIO, LobbySettings } from "../game-lobbies.types";
import DB from "../../../db";
import handleUserAlreadyInLobby from "./handle-user-already-in-lobby";
import Lobby from "../lobby";
import tryAuth from "../../../checkers/try-auth";
import NotificationAlert from "../../../module/notification-alert";

export default function createLobby(
  this: { socket: GameLobbiesIO.SocketIO },
  gameLobbySettings: LobbySettings,
) {
  try {
    const { accName } = tryAuth(this.socket).data;
    const user = DB.User.findByAccNameOrThrow(accName!);

    handleUserAlreadyInLobby(accName!);

    const lobby = new Lobby({ adminAccName: accName!, settings: gameLobbySettings });
    gameLobbies.emit("lobbyCreated", lobby);

    lobby.addUser(user);
    gameLobbies.emit("addedUser", user, lobby.id);

    lobbies.push(lobby);
  } catch (error) {
    if (error instanceof Error) {
      const notification = new NotificationAlert().fromError(error);
      gameLobbies.to(this.socket.id).emit("sendNotification", notification);
    } else {
      console.log("GlobalChat CreateLobby Error:", error);
    }
  }
}





