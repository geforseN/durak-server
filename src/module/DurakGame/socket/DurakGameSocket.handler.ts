import type { DurakGameSocket } from "@durak-game/durak-dts";

import DurakGame from "@/module/DurakGame/DurakGame.js";

import { prisma } from "@/config/index.js";
import durakGamesStore from "@/common/durakGamesStore.js";
import raise from "@/common/raise.js";
import NotificationAlert from "@/module/NotificationAlert/index.js";
import {
  cardPlaceListener,
  stopMoveListener,
} from "@/module/DurakGame/socket/listener/index.js";
import assert from "node:assert";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import type { Logger } from "pino";

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
  log: Logger,
) {
  const {
    data: { user: player },
    nsp: namespace,
  } = socket;
  const gameId = namespace.name.replace("/game/", "");
  console.assert(namespace === this);
  const playerId = player?.id;
  if (typeof playerId !== "string") {
    return handleNotAuthorized(socket);
  }
  socket.onAny((eventName: string, ...args) => log.debug(eventName, args));
  const game = durakGamesStore.getGameWithId(gameId);
  if (!game) {
    return handleNoSuchGameOnline(socket, gameId);
  }
  const asyncGame = Promise.withResolvers<{
    game: DurakGame;
    player: {
      id: string;
      sockets: DurakGameSocket.Socket[];
    };
  }>();
  const asyncGameTimeout = setTimeout(
    () => {
      asyncGame.reject();
    },
    // TODO: make it configurable via env
    1000 * 60 * 2 /* 2 minutes */,
  );
  asyncGame.promise.then(({ game, player }) => {
    clearTimeout(asyncGameTimeout);
    for (const socket of player.sockets) {
      const playerId = player.id;
      socket.join(playerId);
      game.restoreState(socket);
      socket.on("superPlayer__putCardOnDesk", (cardDTO, slotIndex) => {
        cardPlaceListener.call({ game, playerId }, cardDTO, slotIndex);
      });
      socket.on("superPlayer__stopMove", () => {
        stopMoveListener.call({ game, playerId });
      });
      socket.on("disconnect", (_reason, _description) => {
        socket.leave(playerId);
      });
    }
  });
  if (/* is game already started */ game instanceof DurakGame) {
    asyncGame.resolve({
      game,
      player: {
        id: playerId,
        sockets: [socket],
      },
    });
  } else if (game instanceof NonStartedDurakGame) {
    game.addPlayerConnection(socket);
    if (!game.isAllPlayersConnected) {
      socket.emit("nonStartedGame::details", {
        joinedPlayersIds: [...this.sockets.keys()],
      });
    } else {
      const storeGame = durakGamesStore.values.get(game.info.id);
      let startedGame: DurakGame;
      if (storeGame instanceof DurakGame) {
        console.error('race condition "game" in "durakGamesStore"');
        startedGame = storeGame;
      } else if (storeGame) {
        // TODO: game must not emit anything (round emits 100%)
        startedGame = new DurakGame(game, namespace);
        durakGamesStore.values.set(startedGame.info.id, startedGame);
      } else {
        throw new Error("storeGame is not DurakGame or NonStartedDurakGame");
      }
      const playerSocketsSet = game.sockets.get(player.id);
      assert.ok(playerSocketsSet);
      asyncGame.resolve({
        game: startedGame,
        player: {
          id: playerId,
          sockets: [...playerSocketsSet],
        },
      });
    }
  }
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
