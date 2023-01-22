import { Socket } from "socket.io";
import { parse } from "cookie";

export default function tryAuth(socket: Socket): Socket<{}, {}, {}, {accName: string}> {
  const { cookie } = socket.handshake.headers;

  if (!cookie) throw new Error("Не удалось получить cookie");

  const { accName } = parse(cookie);
  if (!accName) throw new Error("Не авторизированны");

  socket.data.accName = accName;
  return socket;
}