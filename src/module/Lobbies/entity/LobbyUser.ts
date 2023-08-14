import { User, UserProfile } from "@prisma/client";

export default class LobbyUser {
  id: string;
  [key: keyof UserProfile]: UserProfile[keyof UserProfile];
  isAdmin;

  constructor(user: User & { profile: UserProfile }) {
    this.id = user.id;
    user.profile;
    Object.getOwnPropertyNames(user.profile).forEach((key: string) => {
      this[key] = user.profile[key as keyof UserProfile];
    });
    this.isAdmin = false;
  }
}
