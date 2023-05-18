import { GamesIO } from "./games.types";
import { durakGames } from "../../index";
import { cardPlaceListener, stopMoveListener } from "./listener";

export default function gameHandler(
  this: { namespace: GamesIO.NamespaceIO },
  socket: GamesIO.SocketIO,
) {
  const { data: { id: playerId }, nsp: { name: gameId } } = socket;
  const game = durakGames.get(gameId);
  socket.onAny((eventName: string, ...args) => console.log(eventName, args));
  if (!game) return handleNoSuchGameOnline(socket);
  if (!playerId) return handleNotAuthorized(socket);
  if (!game.round) game.start(this.namespace);
  try {
    game.players.getPlayer({ id: playerId });
    this.namespace.to(playerId).emit('game__currentId', game.info.id)
    game.service?.restoreState({ game, socket, playerId });
  } catch (error) {
    if (error instanceof Error) console.log("RESTORE STATE ERROR", error);
    else console.log("IDK", error);
  }
  socket.on("superPlayer__putCardOnDesk", cardPlaceListener.bind({ game, playerId }));
  socket.on("superPlayer__stopMove", stopMoveListener.bind({ game, playerId }));
  // socket.on("player__gaveUp", () => {
  //   game.players.manager.remove({ player: game.players.getPlayer({ id: playerId }) });
  // });
}

function handleNoSuchGameOnline(socket: GamesIO.SocketIO) {
  // console.log("no such game")
  socket.disconnect();
}

function handleNotAuthorized(socket: GamesIO.SocketIO) {
  // console.log("not authorized to such game")
  socket.disconnect();
  // socket.removeListener("superPlayer__putCardOnDesk")
  // socket.off("superPlayer__stopMove")
}
