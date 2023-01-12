export enum Privacy {
  "public",
  "private",
  "friendsOnly",
}

export type PrivacySettings = {
  showFriendList: Privacy;
  showGameStat: Privacy;
  showGameHistory: Privacy;
  canPostCommentsOnProfile: Privacy;
};

const defaultPrivacySettings: PrivacySettings = {
  showFriendList: Privacy.public,
  showGameStat: Privacy.public,
  showGameHistory: Privacy.public,
  canPostCommentsOnProfile: Privacy.private,
};


export default defaultPrivacySettings;
