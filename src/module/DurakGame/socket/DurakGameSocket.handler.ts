import type { DurakGameSocket } from "@durak-game/durak-dts";

import DurakGame from "@/module/DurakGame/DurakGame.js";

import { prisma, sessionStore } from "@/config/index.js";
import durakGamesStore from "@/common/durakGamesStore.js";
import NotificationAlert from "@/module/NotificationAlert/index.js";
import {
  cardPlaceListener,
  stopMoveListener,
} from "@/module/DurakGame/socket/listener/index.js";
import assert from "node:assert";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import type { Logger } from "pino";
import type { SessionStore } from "@fastify/session";
import type { Session } from "fastify";

function getSid(socket: DurakGameSocket.Socket) {
  const { cookie } = socket.handshake.headers;
  if (typeof cookie !== "string") {
    return null;
  }
  const cookieSessionId = getSidFromCookie(cookie);
  return cookieSessionId;
}

export async function getSession(
  sessionId: string,
  sessionStore: SessionStore,
) {
  const asyncSession = Promise.withResolvers<Session>();
  sessionStore.get(sessionId, (error, session) => {
    if (error || !session || !session.user) {
      console.log(
        {
          error,
          session,
        },
        "store couldn't get session data",
      );
      asyncSession.reject();
    } else {
      asyncSession.resolve(session);
    }
  });
  return asyncSession.promise;
}

export function getSidFromCookie(fullCookie: string) {
  const match = fullCookie.match(/(?:^|;\s*)sessionId=([^;]+)/);
  if (!match) {
    return null;
  }
  const sessionId = decodeURIComponent(match[1]);
  if (sessionId === null) {
    return null;
  }
  const sid = sessionId.split(".")[0];
  if (typeof sid !== "string") {
    console.warn("sid is not string");
    return null;
  }
  return sid;
}

// TODO add logic for NonStartedGame graceful remove
// IF could not create game THEN send to socket THAT the game could get started
// NOTE: game can be non started if user have not redirected to game page for some time (like 20 seconds or so)
export default async function durakGameSocketHandler(
  this: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
  log: Logger,
) {
  // TODO: ensure gameId is uuid (via zod)
  const gameId = this.name.replace("/game/", "");
  socket.onAny((eventName: string, ...args) => log.debug(eventName, args));
  const game = durakGamesStore.getGameWithId(gameId);
  if (!game) {
    return handleNoSuchGameOnline(socket, gameId);
  }
  const sid = getSid(socket);
  if (sid === null) {
    return handleNotAuthorized(socket);
  }
  socket.data.sid = sid;
  // TODO: add zod safeParse usage
  const session = await getSession(sid, sessionStore)
    .then((session) => {
      if (
        !("user" in session) ||
        typeof session.user !== "object" ||
        session.user === null ||
        typeof session.user.id !== "string"
      ) {
        return null;
      }
      return session;
    })
    .catch(() => null);
  if (session === null) {
    return handleNotAuthorized(socket);
  }
  socket.data.user = session.user;
  const asyncGame = Promise.withResolvers<{
    game: DurakGame;
    player: {
      id: string;
      sockets: DurakGameSocket.Socket[];
    };
  }>();
  const playerId = session.user!.id;
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
