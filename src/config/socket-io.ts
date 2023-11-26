import type { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { DurakGameSocket } from "@durak-game/durak-dts";
import durakGameSocketHandler from "../module/DurakGame/socket/DurakGameSocket.handler.js";
import { SessionStore } from "@fastify/session";
import { mutateSocketData } from "../module/DurakGame/socket/mutateSocketData.js";

export function createSocketIoServer(
  io: Server,
  sessionStore: SessionStore,
) {
  const gamesNamespace: DurakGameSocket.Namespace = io.of(
    /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  );
  gamesNamespace.use((socket, next) => {
    mutateSocketData.call(null, socket, next, sessionStore);
  });
  gamesNamespace.on("connection", durakGameSocketHandler);
  instrument(io, { auth: false, mode: "development" });
}
