import {
  createFastify,
  createSocketIoServer,
  env,
  sessionStore,
} from "./config/index.js";

main();

async function main() {
  let fastify: Awaited<ReturnType<typeof createFastify>> | undefined;
  try {
    fastify = createFastify(env, sessionStore);
    const { BasePlayer } = await import(
      "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
    );
    BasePlayer.configureDependencies();
    createSocketIoServer(env, sessionStore);
    await fastify.listen({ port: env.PORT });
  } catch (err) {
    fastify?.log.error(err);
    process.exit(1);
  }
}
