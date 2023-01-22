import { IO } from "../../index.types";
import tryAuth from "../../checkers/try-auth";
import { io } from "../../index";
import generateNotificationFromError from "../../utils/generate-notification-from-error";
import DB from "../../db";
import { ConnectStatus } from "../../db/enum/connect-status.enum";
import { User } from "../../db/user";


export default function ioHandler(socket: IO.SocketIO) {
  try {
    const accName = tryAuth(socket).data.accName!;

    const { photoUrl, urlToProfile, nickname, ...user } = DB.User.findByAccNameOrThrow(accName);
    const connectStatus = handleConnectStatus({
      connectStatus: user.connectStatus,
      isInvisible: user.isInvisible,
    });
    io.to(socket.id).emit("authenticationSuccess", { accName, photoUrl, urlToProfile, connectStatus, nickname });
    // TODO send to friends of this.socket alert that this.user is online
  } catch (error) {
    if (error instanceof Error) {
      const notification = generateNotificationFromError(error);
      io.to(socket.id).emit("sendNotification", notification);
    } else {
      console.log("GlobalChat Error:", error);
    }
  }
}

type UserConnectInfo = Pick<User, "connectStatus" | "isInvisible">

function handleConnectStatus({ isInvisible, connectStatus }: UserConnectInfo): ConnectStatus {
  if (isInvisible) return ConnectStatus.offline;

  if (connectStatus === ConnectStatus.offline) {
    return ConnectStatus.online;
  } else return ConnectStatus.away;
}