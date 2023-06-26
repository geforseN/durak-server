import { Namespace, Socket } from "socket.io";
import { randomUUID } from "crypto";
import ChatMessage from "../module/Chat/entity/ChatMessage";
import NotificationAlert from "../module/notification-alert";

/*** @deprecated this namespace is deprecated */
export namespace ChatIO {
  export type ClientToServerEvents = {
    "sendMessage": (text: string, replyMessageId?: ReturnType<typeof randomUUID>) => void;
  };

  export type ServerToClientEvents = {
    "restoreHistory": (globalChat: ChatMessage[]) => void;
    "sendMessage": (message: ChatMessage) => void;
    "sendNotification": (notification: NotificationAlert) => void;
  };

  export type InterServerEvents = {};

  export type SocketData = {
    sid: string;
    userId: string
  };

  export type SocketIO = Socket<
    ChatIO.ClientToServerEvents,
    ChatIO.ServerToClientEvents,
    ChatIO.InterServerEvents,
    ChatIO.SocketData
  >;

  export type NamespaceIO = Namespace<
    ChatIO.ClientToServerEvents,
    ChatIO.ServerToClientEvents,
    ChatIO.InterServerEvents,
    ChatIO.SocketData
  >;
}
