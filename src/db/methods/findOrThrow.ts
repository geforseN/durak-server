import { Socket } from "socket.io";
import { User } from "../shema";
import DB from "../index";

export default function findOrThrow(socket: Socket & { accName?: string }): User | never {
  const error = new Error();
  error.name = "ПользовательНеНайден";
  const user = DB.User.getAll().find((user) => user.accName === socket.accName);
  if (!user) {
    error.message = "Вы не авторизированны";
  } else return user;
  throw error;
}
