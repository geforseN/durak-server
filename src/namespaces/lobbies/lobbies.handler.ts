import { LobbiesIO } from "./lobbies.types";
import createLobby from "./methods/create-lobby";
import joinLobby from "./methods/join-lobby";
import createGame from "./methods/create-game";
import { lobbies, lobbiesService } from "../../index";
import { PrismaClient } from "@prisma/client";


export type CreateLobbyContext = {
  socket: LobbiesIO.SocketIO,
  prisma: PrismaClient
};
export type JoinLobbyContext = CreateLobbyContext;

const prisma = new PrismaClient();

export default function lobbiesHandler(socket: LobbiesIO.SocketIO) {
  socket.emit("restoreLobbies", lobbiesService.lobbiesValue);
  const lobbyId = lobbiesService.lobbiesValue.find((lobby) => {
    return lobby.users.find((user) => user.accname === socket.data.sid);
  })?.id;
  if (lobbyId) socket.join(lobbyId);
  socket.on("createLobby", createLobby.bind({ socket, prisma }));
  socket.on("joinLobby", joinLobby.bind({ socket, prisma }));
  socket.on("createGame", createGame.bind({ socket }));
  socket.on("leaveLobby", async (lobbyId: string) => {
    try {
      const accname = assertGuestSocket(socket);
      const lobby = lobbies.tryFindLobby({ id: lobbyId });
      const user = await prisma.user.findUniqueOrThrow({ where: {id: accname} });
      lobbiesService.removeUserFromLobby(lobby, user);
      if (lobby.hasNoUsers) {
        lobbiesService.deleteLobby(lobby);
      }
    } catch (error) {
      lobbiesService.handleError({ name: "JoinLobbyError", error, socket });
    }
  });
}
