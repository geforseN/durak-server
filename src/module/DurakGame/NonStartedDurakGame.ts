import type Lobby from "../Lobbies/entity/Lobby.js";
import { durakGamesStore, raise } from "../../index.js";
import { addListenersWhichAreNeededForStartedGame } from "./socket/DurakGameSocket.handler.js";
import type DurakGame from "./DurakGame.js";
import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";
import LobbyUser from "../Lobbies/entity/LobbyUser.js";

export default class NonStartedDurakGame {
  info: {
    id: string;
    adminId: string;
    durakPlayerId?: string;
    namespace?: DurakGameSocket.Namespace;
    status: "non started";
  };
  sockets: Map<string, Set<DurakGameSocket.Socket>>;
  settings: GameSettings;
  usersInfo: LobbyUser[];

  constructor(lobby: Lobby) {
    this.info = {
      id: lobby.id,
      adminId: lobby.slots.admin.id,
      status: 'non started',
    };
    this.settings = lobby.settings;
    this.usersInfo = lobby.userSlots.map((slot) => slot.user.toJSON());
    this.sockets = new Map();
  }

  get isAllPlayersConnected() {
    return this.sockets.size === this.settings.userCount;
  }

  addPlayerConnection(socket: DurakGameSocket.Socket) {
    this.#addPlayerConnection(socket);
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

  emitSocketWithLoadingDetails(socket: DurakGameSocket.Socket) {
    socket.emit("nonStartedGame::details", {
      joinedPlayersIds: [...this.sockets.keys()],
    });
  }

  handleSocketConnection(
    socket: DurakGameSocket.Socket,
    namespace: DurakGameSocket.Namespace,
  ) {
    this.addPlayerConnection(socket);
    if (!this.isAllPlayersConnected) {
      this.emitSocketWithLoadingDetails(socket);
    } else {
      durakGamesStore.updateNonStartedGameToStarted(this, namespace);
    }
  }

  emitEverySocketWithStartedGameDetails(startedGame: DurakGame) {
    this.sockets.forEach((playerSockets) => {
      playerSockets.forEach((socket) => {
        addListenersWhichAreNeededForStartedGame.call(socket, startedGame);
      });
    });
  }
}
