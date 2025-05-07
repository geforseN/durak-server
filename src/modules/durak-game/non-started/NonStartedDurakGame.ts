import type { GameSettings } from "@durak-game/durak-dts";
import type PlayerWebSocketConnection from "@/modules/durak-game/websocket/player-websocket-connection.js";
import type NonStartedGamePlayersConnections from "@/modules/durak-game/non-started/players-connections.js";

export default class NonStartedDurakGame {
  constructor(
    readonly id: string,
    readonly setting: GameSettings,
    private readonly connections: NonStartedGamePlayersConnections,
  ) {}

  connect(connection: PlayerWebSocketConnection) {
    this.connections.add(connection);
  }

  sleepUntilCanBecomeReady() {
    return this.connections.sleepUntilAllConnected();
  }
}
