import assert from "node:assert";
import z from "zod";
import durakGamesStore from "@/common/durakGamesStore.js";

declare module "fastify" {
  interface FastifyInstance {
    durakGamesStore: typeof durakGamesStore;
  }
}

export default <FastifyPluginAsyncZod>async function (app) {
  app.decorate("durakGamesStore", durakGamesStore);

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
