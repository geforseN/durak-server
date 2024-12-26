import type { Server } from "socket.io";
import type { Logger } from "pino";
import type { DurakGameSocket } from "@durak-game/durak-dts";
import durakGameSocketHandler from "@/module/DurakGame/socket/DurakGameSocket.handler.js";
import { isDevelopment } from "std-env";

export async function createSocketIoServer(io: Server, log: Logger) {
  const gamesNamespace: DurakGameSocket.Namespace = io.of(
    /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  );
  gamesNamespace.on(
    "connection",
    function (this: DurakGameSocket.Namespace, socket) {
      durakGameSocketHandler.call(this, socket, log);
    },
  );
  if (isDevelopment) {
    const { instrument } = await import("@socket.io/admin-ui");
    instrument(io, { auth: false, mode: "development" });
  }
}
