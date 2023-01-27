import { JoinLobbyContext } from "../lobbies.handler";
import assertGuestSocket from "../helpers/assert-guest-socket";
import { lobbiesService } from "../../../index";

export default async function joinLobby(
  this: JoinLobbyContext,
  lobbyId: string,
  _cellIndex: number,
) {
  try {
    const accname = assertGuestSocket(this.socket);
    const lobby = lobbiesService.prepareBeforeJoin({ accname }, { id: lobbyId });
    const user = await this.xprisma.user.findOrThrow({ accname });
    lobbiesService.addUserInLobby(lobby, user);
    this.socket.join(lobby.id);
  } catch (error) {
    lobbiesService.handleError({ name: "JoinLobbyError", error, socket: this.socket });
  }
}
