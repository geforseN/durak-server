import type { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { DurakGameSocket } from "@durak-game/durak-dts";
import { SessionStore } from "@fastify/session";
import { mutateSocketData } from "@/module/DurakGame/socket/mutateSocketData.js";

export function createDurakSocketIoNamespace(
  io: Server,
  sessionStore: SessionStore,
) {
  const gamesNamespace: DurakGameSocket.Namespace = io.of(
    /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  );
  gamesNamespace.use((socket, next) => {
    mutateSocketData(socket, next, sessionStore);
  });
  instrument(io, { auth: false, mode: "development" });
  return gamesNamespace;
}
