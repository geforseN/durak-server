import { parse } from "cookie";
import { LobbiesIO } from "./lobbies.types";
import { ExtendedError } from "socket.io/dist/namespace";

export default function onConnectMiddleware(socket: LobbiesIO.SocketIO, next: (err?: (ExtendedError | undefined)) => void) {
  if (!socket.handshake.headers.cookie) return next();
  const { sid } = parse(socket.handshake.headers.cookie);
  if (!sid) return next();
  socket.data.sid = sid;
  socket.join(sid);
  return next();
}