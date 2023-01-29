import checkTextLength from "./check-text-length";
import createMessage from "../../utils/create-message";
import { globalChat } from "../../index";
import { GlobalChatDB } from "./global-chat.namespace";
import { GlobalChatIO } from "./global-chat.types";
import tryAuth from "../../checkers/try-auth";
import NotificationAlert from "../../module/notification-alert";
import { PrismaClient } from "@prisma/client";

const globalChatCache: GlobalChatDB.Message[] = [];

const prisma = new PrismaClient();

export default function globalChatHandler(socket: GlobalChatIO.SocketIO) {
  socket.emit("restoreHistory", globalChatCache);

  socket.on("sendMessage", async (text) => {
    try {
      const { accname } = tryAuth(socket).data!;
      checkTextLength(text);

      const user = await prisma.user.findUniqueOrThrow({ where: { accname: accname } });

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
