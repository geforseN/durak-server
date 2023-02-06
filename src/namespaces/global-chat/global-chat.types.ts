import { Namespace, Socket } from "socket.io";
import { GlobalChatDB } from "./global-chat.namespace";
import NotificationAlert from "../../module/notification-alert";

export namespace GlobalChatIO {
  export type ClientToServerEvents = {
    "sendMessage": (text: string) => void;
  };

  export type ServerToClientEvents = {
    "restoreHistory": (globalChat: GlobalChatDB.Message[]) => void;
    "sendMessage": (message: GlobalChatDB.Message) => void;
    "sendNotification": (notification: NotificationAlert) => void;
  };

  export type InterServerEvents = {};

  export type SocketData = {
    accname: string;
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
