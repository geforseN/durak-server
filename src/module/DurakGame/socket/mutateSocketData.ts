import type { DurakGameSocket } from "@durak-game/durak-dts";
import type { SessionStore } from "@fastify/session";
import { getSid } from "./getSid.js";

export function mutateSocketData(
  socket: DurakGameSocket.Socket,
  next: (err?: Error) => void,
  sessionStore: SessionStore,
) {
  const sid = getSid(socket, next, console);
  if (!sid) return next();
  sessionStore.get(sid, (error, session) => {
    if (error || !session) {
      console.log(
        {
          error,
          session,
        },
        "store couldn't get session data",
      );
      return next();
    }
    socket.data.sid = sid;
    socket.data.user = session.user;
    return next();
  });
}
