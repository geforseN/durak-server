import { Socket } from "socket.io";
import { parse } from "cookie";
import DB from "./db";
import { ExtendedError } from "socket.io/dist/namespace";

export default function funnyCheckAuth(
  socket: Socket & { accName?: string },
  next: (err?: ExtendedError) => void,
) {
  const { cookie } = socket.handshake.headers;
  // TODO look at socket.handshake.auth

  if (!cookie) next(new Error("Не получилось получить cookie"));

  const { accName } = parse(cookie!);
  if (!accName) next(new Error("Добавьте cookie username"));

  socket.accName = accName;
  next();
}
