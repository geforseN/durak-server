import { Socket } from "socket.io";

export default function checkSocketAuth(socket: Socket & { accName?: string }): undefined | never {
  if (!socket.accName) throw new Error("Не найден пользователь");
  return;
}
