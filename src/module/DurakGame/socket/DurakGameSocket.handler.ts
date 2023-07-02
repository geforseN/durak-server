import { DurakGameSocket } from "./DurakGameSocket.types";
import { durakGames } from "../../../index";
import { cardPlaceListener, stopMoveListener } from "./listener";

export default function durakGameSocketHandler(
  this: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
) {
  const { data: { sid: playerId }, nsp: { name: gameId } } = socket;
  const game = durakGames.get(gameId);
  socket.onAny((eventName: string, ...args) => console.log(eventName, args));
  if (!game) return handleNoSuchGameOnline(socket);
  if (!playerId) return handleNotAuthorized(socket);
  if (!game.round) game.start(this);
  try {
    game.players.getPlayer({ id: playerId });
    this.to(playerId).emit("game__currentId", game.info.id);
    game.service?.restoreState({ game, socket, playerId });
  } catch (error) {
    if (error instanceof Error) console.log("RESTORE STATE ERROR", error);
    else console.log("IDK", error);
  }
  socket.on("superPlayer__putCardOnDesk", cardPlaceListener.bind({ game, playerId }));
  socket.on("superPlayer__stopMove", stopMoveListener.bind({ game, playerId }));
  socket.on("player__exitGame", () => {
    try {
      // game.players.service.remove({ player: game.players.getPlayer({ id: playerId }) });
    } catch (error) {
      console.log(error);
    }
  });
}

function handleNoSuchGameOnline(socket: DurakGameSocket.Socket) {
  // console.log("no such game")
  socket.disconnect();
}

function handleNotAuthorized(socket: DurakGameSocket.Socket) {
  // console.log("not authorized to such game")
  socket.disconnect();
  // socket.removeListener("superPlayer__putCardOnDesk")
  // socket.off("superPlayer__stopMove")
}
