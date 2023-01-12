import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import DB from "./db";
import { ConnectStatus } from "./db/ConnectStatus";

export default function notifyFriends(
  socket: Socket & { accName?: string },
  next: (err?: ExtendedError) => void,
) {
  const { accName } = socket;
  if (!accName) next(new Error("Ошибка сервера"));

  const userIndex = DB.User.findIndex((user) => user.accName === accName);
  if (userIndex === -1) next(new Error("Вы незарегистрированы"));
  const connectedUser = DB.User[userIndex];

  if (!connectedUser.isInvisible) {
    connectedUser.connectStatus = ConnectStatus.online;
    socket.broadcast.emit("user:connected", connectedUser.nickname);
  }

  socket.emit("user:success", accName);
  next();
}
