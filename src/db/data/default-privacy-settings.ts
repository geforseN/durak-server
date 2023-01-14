import { Privacy } from "../enum/privacy.enum";
import { PrivacySettings } from "../privacy-settings";

const defaultPrivacySettings: PrivacySettings = {
  showFriendList: Privacy.public,
  showGameStat: Privacy.public,
  showGameHistory: Privacy.public,
  canPostCommentsOnProfile: Privacy.private,
};

export default defaultPrivacySettings;