import type { IConnection } from "@/modules/abstract/connections.js";
import type { WebSocket } from "ws";

type PlayerId = string;

export type WebsocketPlayerConnection = IConnection & {
  player: {
    id: PlayerId;
    connectedAt: number;
  };
  socket: WebSocket;
};

export default class PlayerWebSocketConnection implements IConnection {
  constructor(
    private readonly playerId: string,
    private readonly websocket: WebSocket,
  ) {}

  belongsTo() {
    return this.playerId;
  }

  send(message: string) {
    this.websocket.send(message);
  }
}
