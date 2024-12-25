import assert from "node:assert";
import z from "zod";
import durakGamesStore from "@/modules/durak-game/durak-games-store-singleton.js";
import type SocketIO from "socket.io";
import { createDurakSocketIoNamespace } from "@/modules/durak-game/create-socket-io-namespace.js";
import { sessionStore } from "@/config/index.js";
import durakGameSocketHandler from "@/module/DurakGame/socket/DurakGameSocket.handler.js";
import { ResolveStartedGameContext } from "@/modules/durak-game/resolve-started-game-context.js";

declare module "fastify" {
  interface FastifyInstance {
    io: SocketIO.Server;
    durakGamesStore: typeof durakGamesStore;
  }
}

export default <FastifyPluginAsyncZod>async function (app) {
  app.decorate("durakGamesStore", durakGamesStore);

  app.ready().then(async () => {
    assert("io" in app);
    const namespace = await createDurakSocketIoNamespace(app.io, sessionStore);
    namespace.on("connection", async (socket) => {
      await durakGameSocketHandler(namespace, socket);
    });
  });

  app.get(
    "/api/durak/games/:gameId",
    {
      schema: {
        params: z.object({
          gameId: z.string().uuid(),
        }),
        // TODO: add response schema for 200 status
      },
    },
    async function (request) {
      const gameId = request.params.gameId;
      const playerId = request.session.user?.id;
      assert.ok(playerId, this.httpErrors.unauthorized());
      const game = this.durakGamesStore.require(gameId);
      const resolveGameContext = new ResolveStartedGameContext(game, (gameId) =>
        this.durakGamesStore.get(gameId),
      );
      const [error, responseJson] = await app.to(
        resolveGameContext.execute(playerId),
      );
      return (
        responseJson || {
          error,
        }
      );
    },
  );
};
