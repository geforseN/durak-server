import { Socket } from "socket.io";
import { parse } from "cookie";
import DB from "./db";
import { ConnectStatus } from "./db/ConnectStatus";
import { ExtendedError } from "socket.io/dist/namespace";

export default function funnyCheckAuth(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const { cookie } = socket.handshake.headers;
  // TODO look at socket.handshake.auth
  
  if (!cookie) next(new Error("Не получилось получить cookie"));

  const { accName } = parse(cookie!);
  if (!accName) next(new Error("Добавьте cookie username"));

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
