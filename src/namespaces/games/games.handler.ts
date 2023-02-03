import { GamesIO } from "./games.types";
import assertGuestSocket from "../lobbies/helpers/assert-guest-socket";
import { durakGames } from "../../index";

export default function gamesHandler(socket: GamesIO.SocketIO) {
  try {
    assertGuestSocket(socket);
  } catch (e) {
    socket.disconnect();
  }

  const { data: { accname }, nsp: { name: gameId } } = socket;

  const game = durakGames.get(gameId);
  if (!game || !accname) return socket.disconnect();

  const player = game.players.getPlayer({ accname });
  if (!player) return socket.disconnect();

  console.log("МОЯ ИГРА", gameId, ":", durakGames.get(gameId)!.talon.count);
}