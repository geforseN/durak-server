import { ConnectStatus } from "./ConnectStatus";
import { PrivacySettings } from "./privacySettings";

export type User = {
  id?: string | number; // id
  nickname: string;
  accName: string;
  urlToProfile?: string; // relation to Profile
  photoUrl: string;
  connectStatus: ConnectStatus;
  isInvisible?: boolean;
};

export type Profile = {
  urlToProfile: string; // id
  email: string;
  privacySettings: PrivacySettings; // json?
  // ADD:
  //  GameHistory[]
  //  GameStat
  //  PrivateMessage[]
};
