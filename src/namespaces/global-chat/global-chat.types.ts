import { Namespace, Socket } from "socket.io";
import { GlobalChatDB } from "../../db/global-chat";
import { NotificationAlert } from "../../notification-alert.type";

export namespace GlobalChatIO {
  export type ClientToServerEvents = {
    "client:sendMessage": (text: string) => void;
  };

  export type ServerToClientEvents = {
    "server:restoreHistory": (globalChat: GlobalChatDB.Message[]) => void;
    "server:sendMessage": (message: GlobalChatDB.Message) => void;
    "server:sendNotification": (notification: NotificationAlert) => void;
  };

  export type InterServerEvents = {};

  export type SocketData = {
    accName: string;
  };

  export type SocketIO = Socket<
    GlobalChatIO.ClientToServerEvents,
    GlobalChatIO.ServerToClientEvents,
    GlobalChatIO.InterServerEvents,
    GlobalChatIO.SocketData
  >;

  export type NamespaceIO = Namespace<
    GlobalChatIO.ClientToServerEvents,
    GlobalChatIO.ServerToClientEvents,
    GlobalChatIO.InterServerEvents,
    GlobalChatIO.SocketData
  >;
}
