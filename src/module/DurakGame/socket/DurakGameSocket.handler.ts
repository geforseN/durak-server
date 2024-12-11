import type { DurakGameSocket } from "@durak-game/durak-dts";

import type DurakGame from "@/module/DurakGame/DurakGame.js";

import { prisma } from "@/config/index.js";
import durakGamesStore from "@/common/durakGamesStore.js";
import raise from "@/common/raise.js";
import NotificationAlert from "@/module/NotificationAlert/index.js";
import { cardPlaceListener, stopMoveListener } from "@/module/DurakGame/socket/listener/index.js";

export function addListenersWhichAreNeededForStartedGame(
  this: DurakGameSocket.Socket,
  game: DurakGame,
) {
  const playerId = this.data.user?.id || raise();
  this.join(playerId);
  game.restoreState(this);
  this.on("superPlayer__putCardOnDesk", (cardDTO, slotIndex) => {
    cardPlaceListener.call({ game, playerId }, cardDTO, slotIndex);
  });
  this.on("superPlayer__stopMove", () => {
    stopMoveListener.call({ game, playerId });
  });
  // TODO player__exitGame handler must not only remove player
  // handler also must handle if left player attacker or defender and more stuff ...
  this.on("player__exitGame", () => {
    try {
      game.players.remove((player) => player.id === playerId).exitGame();
    } catch (error) {
      console.log(error);
    }
  });
  this.on("disconnect", (_reason, _description) => {
    this.leave(playerId);
  });
}

// TODO add logic for NonStartedGame graceful remove
// IF could not create game THEN send to socket THAT the game could get started
// NOTE: game can be non started if user have not redirected to game page for some time (like 20 seconds or so)
export default function durakGameSocketHandler(
  this: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
) {
  const {
    data: { user: player },
    nsp: namespace,
  } = socket;
  const gameId = namespace.name.replace("/game/", "");
  console.assert(namespace === this);
  if (!player?.id) {
    return handleNotAuthorized(socket);
  }
  socket.onAny((eventName: string, ...args) => console.log(eventName, args));
  const game = durakGamesStore.getGameWithId(gameId);
  if (!game) {
    return handleNoSuchGameOnline(socket, gameId);
  }
  // NOTE: here game is instance of NonStartedGame or DurakGame
  game.handleSocketConnection(socket, namespace);
}

function handleNoSuchGameOnline(
  socket: DurakGameSocket.Socket,
  gameId: string,
) {
  console.log("handleNoSuchGameOnline");
  prisma.durakGame
    .findFirstOrThrow({ include: { players: true }, where: { uuid: gameId } })
    .then(
      (game) => {
        socket.emit("finishedGame::restore", { state: game });
      },
      () => {
        socket.emit("finishedGame::notFound");
      },
    )
    .then(() => {
      socket.disconnect();
    });
}

function handleNotAuthorized(socket: DurakGameSocket.Socket) {
  console.log("handleNotAuthorized");
  socket.emit(
    "notification::push",
    new NotificationAlert({
      message: "Вы не авторизованы для просмотра данной игры",
    }),
  );
  socket.disconnect();
}
