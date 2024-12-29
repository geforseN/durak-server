import type { Card } from "@durak-game/durak-dts";
import type { User, UserProfile } from "@prisma/client";

export default class LobbyUser {
  constructor(
    readonly id: User["id"],
    readonly profile: UserProfile,
    public isAdmin = false,
  ) {}

  toJSON() {
    return {
      id: this.id,
      profile: this.profile,
      isAdmin: this.isAdmin,
    };
  }
}
