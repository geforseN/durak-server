import { LobbiesIO } from "../lobbies.types";
import NotAuthorizedError from "../errors/NotAuthorized.error";
import assertSocketData from "./assert-socket-data";

export default function assertGuestSocket(socket: LobbiesIO.SocketIO): string | never {
  assertSocketData(socket)
  if (socket.data.role === "GUEST") {
    incrementBadTriesCount(socket);
    assertBadTriesCount(socket);
    throw new NotAuthorizedError();
  } else return socket.data.accname!;
}

function assertBadTriesCount(socket: LobbiesIO.SocketIO) {
  if (socket.data.badTriesCount === 2)
    socket.to(socket.data.accname!).emit("redirectToLogin");
}

function incrementBadTriesCount(socket: LobbiesIO.SocketIO) {
  socket.data.badTriesCount!++;
}
