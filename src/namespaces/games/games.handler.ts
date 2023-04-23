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
  socket.onAny((eventName: string, ...args) => console.log(eventName, args))
  if (!game) return handleNoSuchGameOnline(socket);
  if (!accname) return handleNotAuthorized(socket);
  if (!game.round) game.start(this.namespace);
  game.service?.restoreState({ game, socket, playerId: accname });

  socket.on("superPlayer__putCardOnDesk", async (card, slotIndex) => {
    try {
      await handlePutCardOnDesk.call({ socket, game, accname }, card, slotIndex);
    } catch (error) {
      console.trace(error)
      game.service?.handleError({ accname, error });
    }
  });

  socket.on("superPlayer__stopMove", () => {
    try {
      handleStopMove.call({ socket, game, accname });
    } catch (error) {
      console.trace(error)
      game.service?.handleError({ accname, error });
    }
  });
}

function handleNoSuchGameOnline(socket: GamesIO.SocketIO) {
  socket.disconnect();
}

function handleNotAuthorized(socket: GamesIO.SocketIO) {
  socket.disconnect();
}