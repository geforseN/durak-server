import type { DurakGameSocket } from "@durak-game/durak-dts";
import {
  UserSchema,
  UserProfileSchema,
} from "@@/prisma/schema/generated/zod/index.js";

import DurakGame from "@/module/DurakGame/DurakGame.js";

import { prisma, sessionStore } from "@/config/index.js";
import durakGamesStore from "@/modules/durak-game/durak-games-store-singleton.js";
import NotificationAlert from "@/module/NotificationAlert/index.js";
import {
  cardPlaceListener,
  stopMoveListener,
} from "@/module/DurakGame/socket/listener/index.js";
import { getSidFromCookie, getUserDataBySessionId } from "@/common/session.js";

const SessionSchema = UserSchema.extend({
  profile: UserProfileSchema,
});

function getSessionId(socket: DurakGameSocket.Socket) {
  const { cookie } = socket.handshake.headers;
  if (typeof cookie !== "string") {
    return null;
  }
  const cookieSessionId = getSidFromCookie(cookie);
  return cookieSessionId;
}

// TODO add logic for NonStartedGame graceful remove
// IF could not create game THEN send to socket THAT the game could get started
// NOTE: game can be non started if user have not redirected to game page for some time (like 20 seconds or so)
export default async function durakGameSocketHandler(
  io: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
) {
  const gameId = io.name.replace("/game/", "");
  // TODO: throw if gameId is not uuid
  console.assert(io === socket.nsp);
  const sessionId = getSessionId(socket);
  if (sessionId === null) {
    return handleNotAuthorized(socket);
  }
  socket.data.sid = sessionId;
  const user = await getUserDataBySessionId(sessionId, sessionStore)
    .then((session) => {
      const parse = SessionSchema.safeParse(session);
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
  const game = durakGamesStore.require(gameId);
  if (!game) {
    return handleNoSuchGameOnline(socket, gameId);
  }
  if (!(game instanceof DurakGame)) {
    // FIXME: need to await here
    return
  }
  const playerId = user.id;
  socket.join(playerId);
  // FIXME: restore player state
  socket.emit("game::state::restore", {
    state: game.toGameJSON(),
  })
  socket.on("superPlayer__putCardOnDesk", (cardDTO, slotIndex) => {
    cardPlaceListener(io, game, playerId, cardDTO, slotIndex);
  });
  socket.on("superPlayer__stopMove", () => {
    stopMoveListener(io, game, playerId);
  });
  socket.on("disconnect", (_reason, _description) => {
    socket.leave(playerId);
  });
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
