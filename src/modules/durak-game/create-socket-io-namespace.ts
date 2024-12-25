import type { Server } from "socket.io";
import { DurakGameSocket } from "@durak-game/durak-dts";
import { SessionStore } from "@fastify/session";
import { mutateSocketData } from "@/module/DurakGame/socket/mutateSocketData.js";
import { isDevelopment } from "std-env";

export async function createDurakSocketIoNamespace(
  io: Server,
  sessionStore: SessionStore,
) {
  const gamesNamespace: DurakGameSocket.Namespace = io.of(
    /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  );
  gamesNamespace.use((socket, next) => {
    mutateSocketData(socket, next, sessionStore);
  });
  if (isDevelopment) {
    const { instrument } = await import("@socket.io/admin-ui");
    instrument(io, { auth: false, mode: "development" });
  }
  return gamesNamespace;
}
