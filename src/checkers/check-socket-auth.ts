import { Socket } from "socket.io";

export default function checkSocketAuth(socket: Socket): void | never {
  if (!socket.data.accName) throw new Error("Не найден пользователь");
}
