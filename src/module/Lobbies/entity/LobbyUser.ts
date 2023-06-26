import { randomUUID } from "crypto";

export default class LobbyUser {
  id: string = randomUUID(); // use prisma.user.id
  isAdmin: boolean = false;
  nickname: string = "";

  static hasSameId(this: { id: string }, user?: LobbyUser) {
    return this.id === user?.id;
  }
}
