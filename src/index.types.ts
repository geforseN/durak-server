import { Server, Socket } from "socket.io";

export namespace IO {
  export type ServerToClientEvents = {};

  export type ClientToServerEvents = {};

  export type InterServerEvents = {};

  export type SocketData = {
    accName: string;
  };

  export type SocketIO = Socket<
    IO.ClientToServerEvents,
    IO.ServerToClientEvents,
    IO.InterServerEvents,
    IO.SocketData
  >;

  export type ServerIO = Server<
    IO.ClientToServerEvents,
    IO.ServerToClientEvents,
    IO.InterServerEvents,
    IO.SocketData
  >;
}
