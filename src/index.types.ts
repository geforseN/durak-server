import { Server, Socket } from "socket.io";
import NotificationAlert from "./module/notification-alert";
import { User } from "./db/user";

export type UserA = Omit<User, "id" | "isInvisible">

export namespace IO {
  export type ServerToClientEvents = {
    "authenticationSuccess": (user: UserA) => void,
    "sendNotification": (notification: NotificationAlert) => void;
  };

  export type ClientToServerEvents = {};

  export type InterServerEvents = {};

  export type SocketData = {
    accName: string;
  };

  export type SocketIO = Socket<
    IO.ClientToServerEvents,
    IO.ServerToClientEvents,
    IO.InterServerEvents,
    IO.SocketData
  >;

  export type ServerIO = Server<
    IO.ClientToServerEvents,
    IO.ServerToClientEvents,
    IO.InterServerEvents,
    IO.SocketData
  >;
}
