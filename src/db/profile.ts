import { PrivacySettings } from "./privacy-settings";

// has relation with User (one-to-one)
export type Profile = {
  urlToProfile: string; // @id @unique
  email: string;
  privacySettings: PrivacySettings; // json
};

// TODO add in Profile:
//  GameHistory[]
//  GameStat
//  PrivateMessage[]