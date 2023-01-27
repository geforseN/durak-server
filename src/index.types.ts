import { Server, Socket } from "socket.io";
import NotificationAlert from "./module/notification-alert";
import { LobbyUser } from "./namespaces/lobbies/entity/lobby-users";

export namespace IO {
  export type ServerToClientEvents = {
    "authenticationSuccess": (user: LobbyUser) => void,
    "sendNotification": (notification: NotificationAlert) => void;
  };

  export type ClientToServerEvents = {};

  export type InterServerEvents = {};

  export type SocketData = {
    accname: string;
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
