import { parse } from "cookie";
import { Socket } from "socket.io";

export default function tryAppendSocketData(cookie: string, socket: Socket & { accName?: string }): void | never {
  const { accName } = parse(cookie);
  if (!accName) throw new Error("Отсутствует cookie accName");
  socket.accName = accName;
}