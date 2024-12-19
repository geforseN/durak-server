import type { DurakGameSocket } from "@durak-game/durak-dts";
import {
  UserSchema,
  UserProfileSchema,
} from "@@/prisma/schema/generated/zod/index.js";

import type DurakGame from "@/module/DurakGame/DurakGame.js";

import { prisma, sessionStore } from "@/config/index.js";
import durakGamesStore from "@/common/durakGamesStore.js";
import raise from "@/common/raise.js";
import NotificationAlert from "@/module/NotificationAlert/index.js";
import {
  cardPlaceListener,
  stopMoveListener,
} from "@/module/DurakGame/socket/listener/index.js";
import type { User, UserProfile } from "@prisma/client";

const SessionSchema = UserSchema.extend({
  profile: UserProfileSchema,
});

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

function getSessionId(socket: DurakGameSocket.Socket) {
  const { cookie } = socket.handshake.headers;
  if (typeof cookie !== "string") {
    return null;
  }
  const cookieSessionId = getSessionIdFromCookie(cookie);
  return cookieSessionId;
}

function getSessionIdFromCookie(cookieString: string) {
  const match = cookieString.match(/(?:^|;\s*)sessionId=([^;]+)/);
  const fullMatch = match ? decodeURIComponent(match[1]) : null;
  if (fullMatch === null) {
    return null;
  }
  const sid = fullMatch.split(".")[0];
  if (typeof sid !== "string") {
    console.warn("sid is not string");
    return null;
  }
  return sid;
}

async function getUserDataBySessionId(sessionId: string) {
  let resolveUserData: (arg: User & { profile: UserProfile }) => void;
  let rejectUserData: () => void;
  const userDataPromise = new Promise((resolve, reject) => {
    resolveUserData = resolve;
    rejectUserData = reject;
  });
  sessionStore.get(sessionId, (error, session) => {
    if (error || !session) {
      console.log(
        {
          error,
          session,
        },
        "store couldn't get session data",
      );
      rejectUserData();
    } else {
      resolveUserData(session.user);
    }
  });
  return userDataPromise;
}

// TODO add logic for NonStartedGame graceful remove
// IF could not create game THEN send to socket THAT the game could get started
// NOTE: game can be non started if user have not redirected to game page for some time (like 20 seconds or so)
export default async function durakGameSocketHandler(
  this: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
) {
  const { nsp: namespace } = socket;
  const gameId = namespace.name.replace("/game/", "");
  // TODO: throw if gameId is not uuid
  console.assert(namespace === this);
  const sessionId = getSessionId(socket);
  if (sessionId === null) {
    return handleNotAuthorized(socket);
  }
  socket.data.sid = sessionId;
  const user = await getUserDataBySessionId(sessionId)
    .then((user) => {
      const parse = SessionSchema.safeParse(user);
      if (!parse.success) {
        return null;
      }
      return parse.data;
    })
    .catch(() => null);
  if (user === null) {
    return handleNotAuthorized(socket);
  }
  socket.data.user = user;
  socket.onAny((eventName: string, ...args) => console.log(eventName, args));
  const game = durakGamesStore.get(gameId);
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
