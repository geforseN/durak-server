import { IO } from "../../index.types";
import tryAuth from "../../checkers/try-auth";
import { io } from "../../index";
import NotificationAlert from "../../module/notification-alert";
import { xprisma } from "../../../prisma";


export default async function ioHandler(socket: IO.SocketIO) {
  try {
    const accname = tryAuth(socket).data.accname!;
    const user = await xprisma.user.findOrThrow({accname})
    io.to(socket.id).emit("authenticationSuccess", user);
  } catch (error) {
    if (error instanceof Error) {
      const notification = new NotificationAlert().fromError(error);
      io.to(socket.id).emit("sendNotification", notification);
    } else {
      console.log("GlobalChat Error:", error);
    }
  }
}
