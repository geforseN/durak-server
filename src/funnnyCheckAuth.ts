import { Socket } from "socket.io";
import { parse } from "cookie";
import { ExtendedError } from "socket.io/dist/namespace";

export default function funnyCheckAuth(
  socket: Socket & { accName?: string },
  next: (err?: ExtendedError) => void,
) {
  const { cookie } = socket.handshake.headers;

  if (!cookie) next(new Error("Не удалось получить cookie"));

  const { accName } = parse(cookie!);
  if (!accName) next(new Error("Отсутствует cookie accName"));

  socket.accName = accName;
  next();
}
