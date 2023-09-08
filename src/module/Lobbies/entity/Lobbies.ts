import type { User, UserProfile } from "@prisma/client";
import EventEmitter from "events";
import { durakGamesStore, raise } from "../../../index.js";
import { CustomWebsocketEvent, SocketsStore } from "../../../ws/index.js";
import { FindLobbyError } from "../error.js";
import Lobby, {
  LobbyAdminUpdateEvent,
  LobbyUserJoinEvent,
  LobbyUserMoveEvent,
} from "./Lobby.js";
import LobbyUser from "./LobbyUser.js";
import assert from "node:assert";
import type { GameSettings } from "@durak-game/durak-dts";

export default class Lobbies {
  readonly #emitter: EventEmitter;
  readonly #store: Map<Lobby["id"], Lobby>;

  constructor(socketsStore: SocketsStore, values: [Lobby["id"], Lobby][] = []) {
    this.#store = new Map<Lobby["id"], Lobby>(values);
    this.#emitter = new EventEmitter()
      .on("lobby##remove", ({ lobby }) => {
        this.#store.delete(lobby.id);
        socketsStore.emit(new LobbyRemoveEvent(lobby));
      })
      .on("lobby##add", ({ lobby }) => {
        this.#store.set(lobby.id, lobby);
        socketsStore.emit(new LobbyAddEvent(lobby));
      })
      .on("lobby##upgrade", ({ lobby }: { lobby: Lobby }) => {
        this.#emitter.emit("lobby##remove", { lobby });
        durakGamesStore.updateLobbyToNonStartedGame(lobby);
        const event = new LobbyUpgradeToNonStartedGameEvent(lobby);
        lobby.userSlots.forEach((slot) => {
          socketsStore.room(slot.user.id).emit(event);
        });
      })
      .on("lobby##user##join", ({ lobby, slot }) => {
        socketsStore.emit(new LobbyUserJoinEvent(lobby, slot));
      })
      .on("lobby##user##move", ({ lobby, newSlot, oldSlot }) => {
        socketsStore.emit(new LobbyUserMoveEvent(lobby, newSlot, oldSlot));
      })
      .on("lobby##user##leave", ({ lobby, user }) => {
        socketsStore.emit(new LobbyUserLeaveEvent(lobby, user));
      })
      .on("lobby##admin##update", ({ lobby }) => {
        socketsStore.emit(new LobbyAdminUpdateEvent(lobby));
      });
  }

  toJSON() {
    return [...this.#store.values()];
  }

  getById(lobbyId: Lobby["id"]) {
    const lobby = this.#store.get(lobbyId);
    assert.ok(lobby);
    return lobby;
  }

  // NOTE: IF user didn't send slotIndex (didn't specified slotIndex) THEN slotIndex === -1
  // NOTE: will throw WHEN user wanna join same lobby AND user didn't specified slotIndex
  async addUserInLobby({
    user,
    lobbyId,
    slotIndex,
  }: {
    user: User & { profile: UserProfile };
    lobbyId: Lobby["id"];
    slotIndex: number;
  }) {
    const [pastLobby, desiredLobby] = [
      this.#findLobbyWithUser(user.id),
      this.#store.get(lobbyId) || raise(new FindLobbyError()),
    ];
    if (!pastLobby) {
      return desiredLobby.insertUser(new LobbyUser(user), slotIndex);
    }
    if (pastLobby === desiredLobby) {
      return desiredLobby.moveUser(user.id, slotIndex);
    }
    return desiredLobby.pickUserFrom(pastLobby, user.id, slotIndex);
  }

  pushNewLobby({
    settings,
    initiator,
  }: {
    settings: GameSettings;
    initiator: User & { profile: UserProfile };
  }) {
    const pastLobby = this.#findLobbyWithUser(initiator.id);
    if (pastLobby) {
      pastLobby.removeUser(initiator.id);
    }
    const lobby = new Lobby(settings, this.#emitter);
    lobby.insertUser(new LobbyUser(initiator), 0);
    return lobby;
  }

  upgradeLobbyToNonStartedGame({
    initiator,
    lobbyId,
  }: {
    lobbyId?: Lobby["id"];
    initiator: User & { profile: UserProfile };
  }) {
    return this.#getLobby(initiator.id, lobbyId).upgradeToNonStartedGame(
      initiator,
    );
  }

  removeLobby({
    initiator,
    lobbyId,
  }: {
    lobbyId?: Lobby["id"];
    initiator: User & { profile: UserProfile };
  }) {
    return this.#getLobby(initiator.id, lobbyId).deleteSelf(initiator.id);
  }

  removeUserFromLobby(leaver: User, lobbyId?: Lobby["id"]) {
    return this.#getLobby(leaver.id, lobbyId).removeUser(leaver.id);
  }

  #getLobby(userId: User["id"], lobbyId?: Lobby["id"]) {
    return (
      (lobbyId && this.#store.get(lobbyId)) ||
      this.#findLobbyWithUser(userId) ||
      raise(new FindLobbyError())
    );
  }

  #findLobbyWithUser(userId: User["id"]): Lobby | undefined {
    for (const lobby of this.#store.values()) {
      if (lobby.hasUser(userId)) return lobby;
    }
  }
}

class LobbyAddEvent extends CustomWebsocketEvent {
  lobby;

  constructor(lobby: Lobby) {
    super("lobby::add");
    // TODO: test if can remove toJSON call
    // TODO just this.lobby = lobby
    this.lobby = lobby.toJSON();
  }
}

class LobbyRemoveEvent extends CustomWebsocketEvent {
  lobbyId;

  constructor(lobby: Lobby) {
    super("lobby::remove");
    this.lobbyId = lobby.id;
  }
}

class LobbyUpgradeToNonStartedGameEvent extends CustomWebsocketEvent {
  gameId;

  constructor(lobby: Lobby) {
    super("lobby::upgrade");
    this.gameId = lobby.id;
  }
}

class LobbyUserLeaveEvent extends CustomWebsocketEvent {
  lobbyId;
  userId;

  constructor(lobby: Lobby, user: LobbyUser) {
    super("lobby::user::leave");
    this.lobbyId = lobby.id;
    this.userId = user.id;
  }
}
