import type { User, UserProfile } from "@prisma/client";

import { Card } from "../../DurakGame/entity/index.js";

/** @property {Card[]} cards - property which can be used, for now, only for tests */
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
    return { ...this, cardsToAdd: undefined };
  }
}
