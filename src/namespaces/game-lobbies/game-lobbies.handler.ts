import { GameLobbiesIO, Lobby } from "./game-lobbies.types";
import { gameLobbies } from "../../index";
import initiateLobbyCreation from "./methods/initiate-lobby-creation";

export const gameLobbiesCashe: Lobby[] = [];

export default function gameLobbiesHandler(socket: GameLobbiesIO.SocketIO) {
  console.log("Hi GAME_LOBBIES", socket.id);

  // gameLobbies.emit("restoreHistory", gameLobbiesCashe);

  socket.on("initiateLobbyCreation", initiateLobbyCreation.bind({ socket }));
  socket.on("joinLobby", (lobbyId, cellIndex) => {
    const { rooms } = gameLobbies.adapter;
    console.log(rooms)

    const isRoomExist = rooms.has(lobbyId);
    if (!isRoomExist) console.error("Нет такого лобби ёпт"); 

    const socketsInRoom = rooms.get(lobbyId)
    if (socketsInRoom) {

    }
    if (cellIndex) {

    }
    

  });
}


