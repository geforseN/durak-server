import { User } from "../user";
import DB from "../index";

export default function findByAccNameOrThrow(accName: string): User | never {
  if (!accName) throw new Error("Не авторизированны");
  const user = DB.User.getAll().find((user) => user.accName === accName,);
  if (!user) throw new Error("Не авторизированны");
  return user;
}
