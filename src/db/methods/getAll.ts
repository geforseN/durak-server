import { User } from "../user";
import users from "../data/users";

export default function getAll(): User[] {
  return users;
}