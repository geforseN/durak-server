import checkTextLength from "../../checkers/check-text-length";
import DB from "../../db";
import createMessage from "../../utils/create-message";
import { globalChat } from "../../index";
import { GlobalChatDB } from "../../db/global-chat";
import { GlobalChatIO } from "./global-chat.types";
import tryAuth from "../../checkers/try-auth";
import NotificationAlert from "../../module/notification-alert";

const globalChatCache: GlobalChatDB.Message[] = [];

export default function globalChatHandler(socket: GlobalChatIO.SocketIO) {
  globalChat.emit("restoreHistory", globalChatCache);

  socket.on("sendMessage", (text) => {
    try {
      const { accName } = tryAuth(socket).data;
      checkTextLength(text);

      const user = DB.User.findByAccNameOrThrow(accName!);

      const message = createMessage(user, text);
      globalChatCache.push(message);
      globalChat.emit("sendMessage", message);
    } catch (error) {
      if (error instanceof Error) {
        const notification = new NotificationAlert().fromError(error);
        globalChat.to(socket.id).emit("sendNotification", notification);
      } else {
        console.log("GlobalChat Error:", error);
      }
    }
  });
}
