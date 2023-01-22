import { ConnectStatus } from "./enum/connect-status.enum";

export type User = {
  accName: string;

  nickname: string;
  urlToProfile: string; // @unique relation to Profile
  photoUrl: string;
  connectStatus: ConnectStatus;

  id?: string | number; // @id @unique
  isInvisible?: boolean;
};

