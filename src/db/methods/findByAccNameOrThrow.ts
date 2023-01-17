import { Socket } from "socket.io";
import { User } from "../user";
import DB from "../index";

export default function findByAccNameOrThrow(socket: Socket): User | never {
  if (!socket.data.accName) throw new Error();
  const user = DB.User.getAll().find(
    (user) => user.accName === socket.data.accName,
  );
  if (!user) throw new Error("Вы не авторизированны");
  return user;
}
