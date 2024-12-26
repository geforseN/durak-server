import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";

import type DurakGamesStore from "@/DurakGamesStore.js";
import type Lobby from "@/module/Lobbies/entity/Lobby.js";

import raise from "@/common/raise.js";
import LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

export default class NonStartedDurakGame {
  info: {
    adminId: string;
    durakPlayerId?: string;
    id: string;
    namespace?: DurakGameSocket.Namespace;
    status: "non started";
  };
  settings: GameSettings;
  sockets: Map<string, Set<DurakGameSocket.Socket>>;
  store?: DurakGamesStore
  usersInfo: LobbyUser[];

  constructor(lobby: Lobby, store?: DurakGamesStore) {
    this.info = {
      adminId: lobby.slots.admin.id,
      id: lobby.id,
      status: 'non started',
    };
    this.store = store
    this.settings = lobby.settings;
    this.usersInfo = lobby.userSlots.map((slot) => slot.user);
    this.sockets = new Map();
  }

  #addPlayerConnection(socket: DurakGameSocket.Socket) {
    const playerId = socket.data.user?.id || raise();
    const playerSockets = this.sockets.get(playerId);
    if (playerSockets) {
      playerSockets.add(socket);
    } else {
      this.sockets.set(playerId, new Set([socket]));
    }
  }

  addPlayerConnection(socket: DurakGameSocket.Socket) {
    this.#addPlayerConnection(socket);
  }

  emitSocketWithLoadingDetails(socket: DurakGameSocket.Socket) {
    socket.emit("nonStartedGame::details", {
      joinedPlayersIds: [...this.sockets.keys()],
    });
  }

  get isAllPlayersConnected() {
    return this.sockets.size === this.settings.players.count;
  }
}
