import tryGetCookie from "../../checkers/try-get-cookie";
import tryAppendSocketData from "../../checkers/try-append-socket-data";
import checkSocketAuth from "../../checkers/check-socket-auth";
import checkTextLength from "../../checkers/check-text-length";
import DB from "../../db";
import createMessage from "../../utils/create-message";
import generateNotificationFromError from "../../utils/generate-notification-from-error";
import { globalChat } from "../../index";
import { GlobalChatDB } from "../../db/global-chat";
import { GlobalChatIO } from "./global-chat.types";

const globalChatCashe: GlobalChatDB.Message[] = [];

export default function globalChatHandler(socket: GlobalChatIO.SocketIO) {
  globalChat.emit("server:restoreHistory", globalChatCashe);

  socket.on("client:sendMessage", (text) => {
    try {
      const cookie = tryGetCookie(socket);
      tryAppendSocketData(cookie, socket);
      checkSocketAuth(socket);
      checkTextLength(text);
      const user = DB.User.findByAccNameOrThrow(socket);
      const message = createMessage(user, text);
      globalChatCashe.push(message);
      globalChat.emit("server:sendMessage", message);
    } catch (error) {
      if (error instanceof Error) {
        const notification = generateNotificationFromError(error);
        globalChat.to(socket.id).emit("server:sendNotification", notification);
      } else {
        console.log("GlobalChat Error:", error);
      }
    }
  });
}
