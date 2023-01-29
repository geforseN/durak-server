import { LobbiesIO } from "./lobbies.types";
import createLobby from "./methods/create-lobby";
import joinLobby from "./methods/join-lobby";
import createGame from "./methods/create-game";
import { xprisma, XPrismaClient } from "../../../prisma";
import { lobbiesService } from "../../index";


export type CreateLobbyContext = {
  socket: LobbiesIO.SocketIO,
  xprisma: XPrismaClient
};
export type JoinLobbyContext = CreateLobbyContext;


export default function gameLobbiesHandler(socket: LobbiesIO.SocketIO) {
  socket.emit("restoreLobbies", lobbiesService.getLobbies());

  socket.on("createLobby", createLobby.bind({ socket, xprisma }));
  socket.on("joinLobby", joinLobby.bind({ socket, xprisma }));
  socket.on("createGame", createGame.bind({ socket }));
  socket.on("disconnecting", () => socket.leave(socket.data.accname!));
}
