import type { GameSettings } from "@durak-game/durak-dts";
import type PlayerWebSocketConnection from "@/module/DurakGame/player-websocket-connection.js";
import type NonStartedGamePlayersConnections from "@/module/DurakGame/non-started-game-players-connections.js";

export default class NonStartedDurakGame {
  readonly #connections: NonStartedGamePlayersConnections;

  constructor(
    public readonly id: string,
    public readonly setting: GameSettings,
    connections: NonStartedGamePlayersConnections,
  ) {
    this.#connections = connections;
  }

  connect(connection: PlayerWebSocketConnection) {
    // TODO: ensure in allowed ids, if not than add connection as guest
    this.#connections.add(connection);
  }

  sleepUntilCanBecomeReady() {
    return this.#connections.sleepUntilAllConnected();
  }
}
