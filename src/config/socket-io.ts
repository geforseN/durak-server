import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { DurakGameSocket } from "@durak-game/durak-dts";
import durakGameSocketHandler from "../module/DurakGame/socket/DurakGameSocket.handler.js";
import { getParsedEnv } from "./zod-env.js";
import { SessionStore } from "@fastify/session";
import { mutateSocketData } from "../module/DurakGame/socket/mutateSocketData.js";

export function createSocketIoServer(
  env: ReturnType<typeof getParsedEnv>,
  sessionStore: SessionStore,
) {
  const io = new Server(env.SOCKET_IO_PORT, {
    cors: {
      credentials: true,
      origin: [...env.SOCKET_IO_CORS_ORIGIN],
    },
  });
  const gamesNamespace: DurakGameSocket.Namespace = io.of(
    /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  );
  gamesNamespace.use((socket, next) => {
    mutateSocketData.call(null, socket, next, sessionStore);
  });
  gamesNamespace.on("connection", durakGameSocketHandler);
  instrument(io, { auth: false, mode: "development" });
}
