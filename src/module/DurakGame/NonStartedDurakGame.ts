import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";
import type { SessionUser } from "@/plugins/modules/login/login.instance-decorators.js";

class NonConnectedPlayer {}

class PlayerConnection {
  constructor(
    public sessionUser: SessionUser,
    public socket: DurakGameSocket.Socket,
  ) {}
}

class PlayersConnections<K extends string = SessionUser["id"]> {
  constructor(
    readonly map: Map<K, Set<PlayerConnection>>,
    readonly sizeGoal: number,
    readonly onReady: () => void,
  ) {}

  add(connection: PlayerConnection) {
    const key = connection.sessionUser.id as K;
    const connections = this.map.get(key);
    if (connections) {
      connections.add(connection);
    } else {
      this.map.set(key, new Set([connection]));
      if (this.sizeGoal === this.map.size) {
        this.onReady();
      }
    }
  }

  get(key: K) {
    return this.map.get(key);
  }

  require(
    key: K,
    makeError = () =>
      new Error(`Failed to find connection with user id = ${key}`),
  ) {
    const connections = this.get(key);
    if (!connections) {
      throw makeError();
    }
    return connections;
  }
}

export default class NonStartedDurakGame {
  constructor(
    public id: string,
    public setting: GameSettings,
    public connections: PlayersConnections,
    readonly onReady: () => void,
  ) {}
}
