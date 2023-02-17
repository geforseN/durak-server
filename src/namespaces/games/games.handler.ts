import { GamesIO } from "./games.types";
import { durakGames } from "../../index";
import handlePutCardOnDesk from "./methods/handle-put-card-on-desk";
import handleStopMove from "./methods/handle-stop-move";

export default function gamesHandler(
  this: { namespace: GamesIO.NamespaceIO },
  socket: GamesIO.SocketIO,
) {
  const { data: { accname }, nsp: { name: gameId } } = socket;
  const game = durakGames.get(gameId);
  if (!game) return handleNoSuchGameOnline(socket);
  if (!accname) return handleNotAuthorized(socket);

  if (!game.round?.number) game.start(this.namespace);
  console.log("МОЯ ИГРА", gameId, ":", game.talon.count);

  socket.on("state__restore", () => {
    game.restoreState({ accname, socket })
  });

  socket.on("superPlayer__putCardOnDesk", (card, slotIndex, callback) => {
    try {
      handlePutCardOnDesk.call({ socket, game, accname }, card, slotIndex, callback);
    } catch (error) {
      game.service.handleError({ accname, error });
      callback({ status: "NOK", message: (error as Error).message });
    }
  });

  socket.on("superPlayer__stopMove", () => {
    try {
      handleStopMove.call({ socket, game, accname });
    } catch (error) {
      game.service.handleError({ accname, error });
    }
  });
}

function handleNoSuchGameOnline(socket: GamesIO.SocketIO) {
  socket.disconnect();
}

function handleNotAuthorized(socket: GamesIO.SocketIO) {
  socket.disconnect();
}