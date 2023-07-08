import { randomUUID } from "crypto";

export default class LobbyUser {
  id: string = randomUUID(); // use prisma.user.id
  isAdmin: boolean = false;
  nickname: string = "";
}
