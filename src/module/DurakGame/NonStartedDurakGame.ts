import type { WebSocket } from "ws";
import type { GameSettings } from "@durak-game/durak-dts";
import type Lobby from "@/module/Lobbies/entity/Lobby.js";
import type LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

export default class NonStartedDurakGame {
  info: {
    adminId: string;
    durakPlayerId?: string;
    id: string;
    status: "non started";
  };
  settings: GameSettings;
  sockets: Map<string, Set<WebSocket>>;
  usersInfo: LobbyUser[];

  constructor(lobby: Lobby) {
    this.info = {
      adminId: lobby.slots.admin.id,
      id: lobby.id,
      status: "non started",
    };
    this.settings = lobby.settings;
    this.usersInfo = lobby.userSlots.map((slot) => slot.user);
    this.sockets = new Map();
  }

  addPlayerConnection(playerId: string, socket: WebSocket) {
    const playerSockets = this.sockets.get(playerId);
    if (playerSockets) {
      playerSockets.add(socket);
    } else {
      this.sockets.set(playerId, new Set([socket]));
    }
  }

  get isAllPlayersConnected() {
    return this.sockets.size === this.settings.players.count;
  }
}
