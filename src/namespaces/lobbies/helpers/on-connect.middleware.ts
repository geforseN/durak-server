import { parse } from "cookie";
import { LobbiesIO } from "../lobbies.types";
import { NextSocketIO } from "../../../index";

export default function onConnectMiddleware(socket: LobbiesIO.SocketIO, next: NextSocketIO) {
  socket.data.role = "GUEST"
  socket.data.badTriesCount = 0;

  const { cookie } = socket.handshake.headers;
  if (!cookie) return next();

  const { accname } = parse(cookie!);
  if (!accname) return next();

  socket.data.role = "USER";
  socket.data.accname = accname;
  socket.join(socket.data.accname)
  return next();
}