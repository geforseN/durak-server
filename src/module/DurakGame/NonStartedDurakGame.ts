import { Player } from "./entity/Player";
import { type GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import type Lobby from "../Lobbies/entity/Lobby";
import { type DurakGameSocket } from "./socket/DurakGameSocket.types";
import { raise } from "../..";
import { addListenersWhichAreNeededForStartedGame } from "./socket/DurakGameSocket.handler";
import DurakGame from "./DurakGame";

export default class NonStartedDurakGame {
  info: {
    id: string;
    adminId: string;
    durakPlayerId?: string;
    namespace?: DurakGameSocket.Namespace;
    isStarted: false;
  };
  sockets: Map<Player["info"]["id"], Set<DurakGameSocket.Socket>>;
  settings: GameSettings;
  players: Player[];
  isStarted: false;

  constructor(lobby: Lobby) {
    this.info = {
      id: lobby.id,
      adminId: lobby.slots.admin.id,
      isStarted: false,
    };
    this.settings = lobby.settings;
    this.players = lobby.userSlots.map((slot) => new Player(slot.user));
    this.isStarted = false;
    this.sockets = new Map();
  }

  get isAllPlayersConnected() {
    return this.sockets.size === this.settings.userCount;
  }

  addPlayerConnection(
    socket: DurakGameSocket.Socket,
    namespace: DurakGameSocket.Namespace,
  ) {
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

  emitEverySocketWithStartedGameDetails(startedGame: DurakGame) {
    this.sockets.forEach((playerSockets) => {
      playerSockets.forEach((socket) => {
        addListenersWhichAreNeededForStartedGame.call(socket, startedGame);
      });
    });
  }
}
