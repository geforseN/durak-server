import { Socket } from "socket.io";

export default function tryGetCookie(socket: Socket): string | never{
  const { cookie } = socket.handshake.headers;

  if (!cookie) throw new Error("Не удалось получить cookie");

  return cookie;
}