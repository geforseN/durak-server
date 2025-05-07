export type ConnectionsKey = string;

export interface IConnection {
  /**
   * @returns {string} key (identifier) for connections set that
   */
  belongsTo(): ConnectionsKey;
}

export interface IReadonlyConnections<C extends IConnection> {
  get count(): number;

  with(connection: C): IReadonlyConnections<C>;
}

export default class Connections<C extends IConnection>
  implements IReadonlyConnections<C>
{
  constructor(
    private readonly map: ReadonlyMap<
      ConnectionsKey,
      ReadonlySet<C>
    > = new Map(),
  ) {}

  get count() {
    return this.map.size;
  }

  with(connection: C) {
    const connectionsKey = connection.belongsTo();
    const connections = this.map.get(connectionsKey);
    const newMap = new Map(this.map.entries());
    newMap.set(
      connectionsKey,
      new Set(connections ? [...connections, connection] : [connection]),
    );
    return new Connections(newMap);
  }
}
