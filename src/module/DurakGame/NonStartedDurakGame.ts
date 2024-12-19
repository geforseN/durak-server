import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";
import type Lobby from "@/module/Lobbies/entity/Lobby.js";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import raise from "@/common/raise.js";
import LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";
import { addListenersWhichAreNeededForStartedGame } from "@/module/DurakGame/socket/DurakGameSocket.handler.js";

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

  get id() {
    return this.info.id;
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

  emitEverySocketWithStartedGameDetails(startedGame: DurakGame) {
    this.sockets.forEach((playerSockets) => {
      playerSockets.forEach((socket) => {
        addListenersWhichAreNeededForStartedGame.call(socket, startedGame);
      });
    });
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
