import { Privacy } from "./enum/privacy.enum";

export type PrivacySettings = {
  showFriendList: Privacy;
  showGameStat: Privacy;
  showGameHistory: Privacy;
  canPostCommentsOnProfile: Privacy;
};

