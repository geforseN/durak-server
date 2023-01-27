import { type CreateLobbyContext } from "../lobbies.handler";
import { GameSettings } from "../lobbies.types";
import assertGuestSocket from "../helpers/assert-guest-socket";
import { lobbiesService } from "../../../index";

export default async function createLobby(
  this: CreateLobbyContext,
  settings: GameSettings,
) {
  try {
    const accname = assertGuestSocket(this.socket)!;
    const user = await this.xprisma.user.findOrThrow({ accname });
    const lobby = lobbiesService.handleLobbyCreation(user, settings)!;
    this.socket.join(lobby.id);
  } catch (error) {
    lobbiesService.handleError({ name: "CreateLobbyError", error, socket: this.socket });
  }
}


