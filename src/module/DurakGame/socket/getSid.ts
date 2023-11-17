import { parse } from "node:querystring";
import type { DurakGameSocket } from "@durak-game/durak-dts";

export function getSid(
  socket: DurakGameSocket.Socket,
  next: (err?: Error) => void,
  logger?: { log: Function },
) {
  if (!socket.handshake.headers.cookie) {
    return next();
  }
  const cookie = parse(socket.handshake.headers.cookie);
  logger?.log({ cookie });
  const sessionId = cookie["sessionId"];
  logger?.log({ sessionId });
  if (!sessionId || Array.isArray(sessionId)) {
    return next();
  }
  const sid = sessionId.split(".")[0];
  logger?.log({ sid });
  return sid;
}
