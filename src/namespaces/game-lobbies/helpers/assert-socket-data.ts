import { GameLobbiesIO } from "../lobbies.types";

export default function assertSocketData({ data }: GameLobbiesIO.SocketIO) {
  if (data.badTriesCount === undefined) throw new Error("NO COUNT");
  if (data.accname === undefined) throw new Error("NO ACCNAME");
  if (data.role === undefined) throw new Error("NO ROLE");
}