import assert from "node:assert";
import z from "zod";
import durakGamesStore from "@/modules/durak-game/store/instance.js";
import PlayerWebSocketConnection from "@/modules/durak-game/websocket/player-websocket-connection.js";
import {
  findGameWithTimeout,
  sleepUntilGameStart,
} from "@/modules/durak-game/store/utils.js";
import type { FastifyRequest } from "fastify";
import { makeStartedGame } from "@/modules/durak-game/started/make.js";

declare module "fastify" {
  interface FastifyRequest {
    requireSessionUserId(): string;
  }
}

function requireSessionUserId(this: FastifyRequest) {
  assert.ok(this.session.user, "session has no user");
  const playerId = this.session.user.id;
  return playerId;
}

export default <FastifyPluginAsyncZod>async function (app) {
  app.decorateRequest("requireSessionUserId", requireSessionUserId);
  app.get(
    "/games/:gameId",
    {
      websocket: true,
      schema: {
        params: z.object({
          gameId: z.string(),
        }),
      },
    },
    async function (socket, request) {
      const { gameId } = request.params;
      const game = await findGameWithTimeout(
        durakGamesStore,
        gameId,
        1500,
        this.log.info.bind(this.log),
      );
      if (!game) {
        // TODO: send that such game does not exist;
        return;
      }
      const playerId = request.requireSessionUserId();
      this.log.info("playerId=%s", playerId);
      const connection = new PlayerWebSocketConnection(playerId, socket);
      const startedGame = await sleepUntilGameStart(
        durakGamesStore,
        game,
        connection,
        makeStartedGame,
      );
      startedGame.connect(connection);
    },
  );
};
