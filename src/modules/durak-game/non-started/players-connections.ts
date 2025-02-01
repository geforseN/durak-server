import type Connections from "@/modules/abstract/connections.js";
import type Goal from "@/modules/abstract/goal.js";
import type PlayerWebSocketConnection from "@/module/DurakGame/player-websocket-connection.js";

export default class NonStartedGamePlayersConnections {
  #values: Connections<PlayerWebSocketConnection>;
  readonly #connectionsCountGoal: Goal<number>;

  constructor(
    values: Connections<PlayerWebSocketConnection>,
    connectionsCountGoal: Goal<number>,
  ) {
    this.#values = values;
    this.#connectionsCountGoal = connectionsCountGoal;
  }

  add(connection: PlayerWebSocketConnection) {
    this.#values = this.#values.with(connection);
    this.#connectionsCountGoal.tryComplete(this.#values.count);
  }

  // TODO: TEST: must resolve when final player got at least one connection
  sleepUntilAllConnected() {
    return this.#connectionsCountGoal.sleepUntilComplete();
  }
}
