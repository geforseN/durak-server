import { DurakGameSocket } from "./DurakGameSocket.types";
import { durakGamesStore, raise } from "../../../index";
import { cardPlaceListener, stopMoveListener } from "./listener";
import DurakGame from "../DurakGame";
import prisma from "../../../../prisma";
import NotificationAlert from "../../notification-alert";

export function addListenersWhichAreNeededForStartedGame(
  this: DurakGameSocket.Socket,
  game: DurakGame,
) {
  const playerId = this.data.user?.id || raise();
  this.join(playerId);
  game.restoreState(this);
  this.on(
    "superPlayer__putCardOnDesk",
    cardPlaceListener.bind({ game, playerId }),
  );
  this.on("superPlayer__stopMove", stopMoveListener.bind({ game, playerId }));
  // TODO player__exitGame handler must not only remove player
  // handler also must handle if left player attacker or defender
  this.on("player__exitGame", () => {
    try {
      game.players.remove((player) => player.id === playerId, game);
    } catch (error) {
      console.log(error);
    }
  });
}

// TODO IF could not create game THEN send to socket THAT the game could get started
export default function durakGameSocketHandler(
  this: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
) {
  const {
    nsp: { name },
    data: { user: player },
  } = socket;
  const gameId = name.replace("/game/", "");
  console.log({ isSame: socket.nsp === this, gameId });
  if (!player?.id) return handleNotAuthorized(socket);
  socket.onAny((eventName: string, ...args) => console.log(eventName, args));
  const game = durakGamesStore.getGameWithId(gameId);
  if (!game) {
    return handleNoSuchGameOnline(socket, gameId);
  }
  if (!game.isStarted) {
    game.addPlayerConnection(socket, this);
    if (!game.isAllPlayersConnected) {
      game.emitSocketWithLoadingDetails(socket);
    } else {
      durakGamesStore.updateNonStartedGameToStarted(game, this);
    }
  } else {
    addListenersWhichAreNeededForStartedGame.call(socket, game);
  }
}

function handleNoSuchGameOnline(
  socket: DurakGameSocket.Socket,
  gameId: string,
) {
  console.log("handleNoSuchGameOnline");
  prisma.durakGame
    .findFirstOrThrow({ where: { uuid: gameId }, include: { players: true } })
    .then(
      (game) => {
        socket.emit("finishedGame::restore", game);
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
