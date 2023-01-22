import { GameLobbiesIO } from "./game-lobbies.types";
import createLobby from "./methods/create-lobby";
import joinLobby from "./methods/join-lobby";
import Lobby from "./lobby";

export const lobbies: Lobby[] = [];

export default function gameLobbiesHandler(socket: GameLobbiesIO.SocketIO) {
  socket.emit("restoreLobbies", lobbies);

  socket.on("createLobby", createLobby.bind({ socket }));
  socket.on("joinLobby", joinLobby.bind({ socket }));
}


