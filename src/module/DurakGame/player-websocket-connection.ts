import type { WebSocket } from "ws";
import type { IConnection } from "@/modules/abstract/connections.js";

type PlayerId = string;

export default class PlayerWebSocketConnection implements IConnection {
  constructor(
    private readonly playerId: PlayerId,
    private readonly websocket: WebSocket,
  ) {}

  belongsTo() {
    return this.playerId;
  }

  send(message: string) {
    this.websocket.send(message);
  }
}
