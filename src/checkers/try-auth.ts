import { Socket } from "socket.io";
import { parse } from "cookie";

type SocketData = {accname?: string}

export default function tryAuth(socket: Socket): Socket<{}, {}, {}, SocketData> {
  const { cookie } = socket.handshake.headers;

  if (!cookie) throw new Error("Не удалось получить cookie");

  const { accname } = parse(cookie);
  if (!accname) throw new Error("Не авторизированны");

  socket.data.accname = accname;
  return socket;
}