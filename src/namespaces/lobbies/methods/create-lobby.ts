import { type CreateLobbyContext } from "../lobbies.handler";
import { GameSettings } from "../lobbies.types";
import { lobbiesService } from "../../../index";

export default async function createLobby(
  this: CreateLobbyContext,
  settings: GameSettings,
) {
  try {
    // LINE BELOW IS WRONG
    const accname = this.socket.data.sid;
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: accname } });
    const lobby = lobbiesService.handleLobbyCreation(user, settings)!;
    this.socket.join(lobby.id);
  } catch (error) {
    lobbiesService.handleError({ name: "CreateLobbyError", error, socket: this.socket });
  }
}


function createLobby_() {
  // getUserId
  // getUser
  // new Lobby
  // add lobbyRoom in lobbyRooms
  // add user in lobbyRoom
}