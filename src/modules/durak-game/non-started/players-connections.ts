import type LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";
import type { IReadonlyConnections } from "@/modules/abstract/connections.js";
import type Goal from "@/modules/abstract/goal.js";
import type PlayerWebSocketConnection from "@/modules/durak-game/websocket/player-websocket-connection.js";

export default class NonStartedGamePlayersConnections {
  constructor(
    private values: IReadonlyConnections<PlayerWebSocketConnection>,
    private readonly lobbyUsers: readonly LobbyUser[],
    private readonly connectionsCountGoal: Goal<number>,
  ) {}

  add(connection: PlayerWebSocketConnection) {
    if (!this.lobbyUsers.some((user) => user.id === connection.belongsTo())) {
      return;
    }
    this.values = this.values.with(connection);
    this.connectionsCountGoal.tryComplete(this.values.count);
  }

  // TODO: test(durak-game): [non-started-players] promise resolve 
  // must resolve when final player got at least one connection
  sleepUntilAllConnected() {
    return this.connectionsCountGoal.sleepUntilComplete();
  }
}
