import type Lobby from "../Lobbies/entity/Lobby";
import { durakGamesStore, raise } from "../..";
import { addListenersWhichAreNeededForStartedGame } from "./socket/DurakGameSocket.handler";
import DurakGame from "./DurakGame";
import { NonStartedGameUser } from "./entity/Player/Player";
import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";

export default class NonStartedDurakGame {
  info: {
    id: string;
    adminId: string;
    durakPlayerId?: string;
    namespace?: DurakGameSocket.Namespace;
    isStarted: false;
  };
  sockets: Map<string, Set<DurakGameSocket.Socket>>;
  settings: GameSettings;
  users: NonStartedGameUser[];
  isStarted: false;

  constructor(lobby: Lobby) {
    this.info = {
      id: lobby.id,
      adminId: lobby.slots.admin.id,
      isStarted: false,
    };
    this.settings = lobby.settings;
    this.users = lobby.userSlots.map(
      (slot) => new NonStartedGameUser(slot.user),
    );
    this.isStarted = false;
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
