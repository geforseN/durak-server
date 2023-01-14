import { ConnectStatus } from "./enum/connect-status.enum";

export type User = {
  id?: string | number; // @id @unique
  nickname: string;
  accName: string;
  urlToProfile?: string; // relation to Profile @unique
  photoUrl: string;
  connectStatus: ConnectStatus;
  isInvisible?: boolean;
};

