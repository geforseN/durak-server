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
      const { gameId } = request.params;
      const sessionUser = request.session.user;
      assert.ok(sessionUser, new Error("Unauthorized"));
      const responseJson = await this.durakGamesStore.resolveStartedGame(
        gameId,
        sessionUser.id,
      );
      return responseJson;
    },
  );
};
