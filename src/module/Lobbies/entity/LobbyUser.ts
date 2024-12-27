import type { Card } from "@durak-game/durak-dts";
import type { User, UserProfile } from "@prisma/client";

export default class LobbyUser {
  cardsToAdd: Card[];
  id: string;
  isAdmin;
  profile: UserProfile;

  constructor(user: User & { profile: UserProfile }, cards: Card[] = []) {
    this.id = user.id;
    this.profile = user.profile;
    this.isAdmin = false;
    this.cardsToAdd = cards;
  }

  toJSON() {
    return {
      id: this.id,
      profile: this.profile,
      isAdmin: this.isAdmin,
    };
  }
}
