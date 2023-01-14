import { Socket } from "socket.io";
import tryGetCookie from "../checkers/try-get-cookie";
import tryAppendSocketData from "../checkers/try-append-socket-data";
import checkSocketAuth from "../checkers/check-socket-auth";
import checkTextLength from "../checkers/check-text-length";
import DB from "../db";
import createMessage from "../utils/create-message";
import { Notification } from "../notification";
import generateNotificationFromError from "../utils/generate-notification-from-error";
import { globalChat } from "../index";
import { GlobalChat } from "../db/global-chat";
const globalChatHistory: GlobalChat.Message[] = [];

const globalChatHandler = (socket: Socket & { accName?: string }) => {
  globalChat.emit("server:restoreHistory", globalChatHistory);

  socket.on("client:sendMessage", (text: string) => {
    try {
      const cookie = tryGetCookie(socket);
      tryAppendSocketData(cookie, socket);
      checkSocketAuth(socket);
      checkTextLength(text);
      const user = DB.User.findOrThrow(socket);
      const message = createMessage(user, text);
      globalChatHistory.push(message);
      globalChat.emit("server:sendMessage", message);
    } catch (error) {
      const notification: Notification = generateNotificationFromError(error as Error);
      globalChat.to(socket.id).emit("server:sendNotification", notification);
    }
  });
}

export default globalChatHandler;