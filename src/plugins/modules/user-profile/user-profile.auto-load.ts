import z from "zod";
import assert from "node:assert";

export default <FastifyPluginAsyncZod>async function (app) {
  app.route({
    method: "GET",
    url: "/api/profiles/:personalLink",
    schema: {
      params: z.object({
        personalLink: z.string({
          description: "Не указана ссылка пользователя",
        }),
      }),
    },
    async handler(request) {
      const user = await this.prisma.userProfile.findFirst({
        where: { personalLink: request.params.personalLink },
        select: {
          nickname: true,
          connectStatus: true,
          photoUrl: true,
          User: { include: { UserGameStat: true } },
        },
      });
      assert.ok(user, "No access");
      return user;
    },
  });
};
