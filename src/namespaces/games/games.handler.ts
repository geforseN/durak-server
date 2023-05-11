import { GamesIO } from "./games.types";
import { durakGames } from "../../index";
import { cardPlaceListener, stopMoveListener } from "./listener";

export default function gameHandler(
  this: { namespace: GamesIO.NamespaceIO },
  socket: GamesIO.SocketIO,
) {
  const { data: { id: playerId }, nsp: { name: gameId } } = socket;
  const game = durakGames.get(gameId);
  socket.onAny((eventName: string, ...args) => console.log(eventName, args))
  if (!game) return handleNoSuchGameOnline(socket);
  if (!playerId) return handleNotAuthorized(socket);
  if (!game.round) game.start(this.namespace);
  game.service?.restoreState({ game, socket, playerId });
  socket.on("superPlayer__putCardOnDesk", cardPlaceListener.bind({ game, playerId }));
  socket.on("superPlayer__stopMove", stopMoveListener.bind({ game, playerId}));
}

function handleNoSuchGameOnline(socket: GamesIO.SocketIO) {
  socket.disconnect();
}

function handleNotAuthorized(socket: GamesIO.SocketIO) {
  socket.disconnect();
}