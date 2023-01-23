import { GameLobbiesIO } from "./game-lobbies.types";
import createLobby from "./methods/create-lobby";
import joinLobby from "./methods/join-lobby";
import Lobby from "./lobby";
import { gameLobbies } from "../../index";

export const lobbies: Lobby[] = [];

export default function gameLobbiesHandler(socket: GameLobbiesIO.SocketIO) {
  socket.emit("restoreLobbies", lobbies);

  socket.on("createLobby", createLobby.bind({ socket }));
  socket.on("joinLobby", joinLobby.bind({ socket }));

  socket.on("createGame", (accName, lobbyId) => {
    try {
      const lobby = lobbies.find((lobby) => lobby.hasSameId(lobbyId));
      const isEmitFromAdmin = lobby?.adminAccName === accName;
      if (!lobby || !isEmitFromAdmin) throw Error("Нет доступа");

      const { users, settings, adminAccName } = lobby;
      const userCount = users.length;

      users.forEach(user => {
        // TODO
        // const userSocketIDs = socketIDs[user.accName] // !!!!!
        // const userId = userSocketIDs["gameLobbies"]
        const userId = String(user.id);
        const gameId = lobbyId; // TODO
        gameLobbies.to(userId).emit("startGame", gameId);
      });

    } catch (error) {

    }


  });
}


