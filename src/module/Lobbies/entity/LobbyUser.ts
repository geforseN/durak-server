import { User, UserProfile } from "@prisma/client";

export default class LobbyUser {
  id: string;
  profile: UserProfile;
  isAdmin;

  constructor(user: User & { profile: UserProfile }) {
    this.id = user.id;
    this.profile = user.profile;
    this.isAdmin = false;
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}
