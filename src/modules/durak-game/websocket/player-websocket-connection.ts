import type { WebSocket } from "ws";
import type { IConnection } from "@/modules/abstract/connections.js";

type PlayerId = string;

export default class PlayerWebSocketConnection implements IConnection {
  applyTo(player: unknown) {
    throw new Error("Method not implemented.");
    if (player)
      this.websocket.addEventListener("message", () => {
        if (!player) {
          // guest can not change game state so
          // guest can not send message to change state
          return;
        }
      });
  }

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
