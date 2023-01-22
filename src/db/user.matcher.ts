import { User } from "./user";

export default function userMatcher(this: { accName: string }, user: User) {
  return user.accName === this.accName;
}