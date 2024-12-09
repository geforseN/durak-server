import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyAutoload from "@fastify/autoload";
import { FastifyInstance } from "fastify";
import { User, UserProfile } from "@prisma/client";


declare module "fastify" {
  interface Session {
    user: User & { profile: UserProfile; isAnonymous: boolean };
  }
}

async function createFastify(app: FastifyInstance) {
  const { BasePlayer } = await import(
    "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
  );
  BasePlayer.configureDependencies();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  await app.register(fastifyAutoload, {
    dir: path.join(__dirname, "plugins"),
    ignorePattern: /^.*(?:test|spec).ts$/,
    indexPattern: /"^.*.auto-load.ts$/,
    forceESM: true,
    encapsulate: false
  });
  return app;
}

export default createFastify;
