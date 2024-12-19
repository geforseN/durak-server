import EventEmitter from "events";
import assert from "node:assert";
import type { User, UserProfile } from "@prisma/client";
import type { InitialGameSettings } from "@durak-game/durak-dts";

import durakGamesStore from "@/modules/durak-game/durak-games-store-singleton.js";
import raise from "@/common/raise.js";
import { CustomWebsocketEvent, SocketsStore } from "@/ws/index.js";

import { FindLobbyError } from "@/module/Lobbies/error.js";
import Lobby, {
  LobbyAdminUpdateEvent,
  LobbyUserJoinEvent,
  LobbyUserMoveEvent,
} from "@/module/Lobbies/entity/Lobby.js";
import LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";

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
        const game = new NonStartedDurakGame(lobby, durakGamesStore);
        durakGamesStore.set(game);
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

  #findLobbyWithUser(userId: User["id"]): Lobby | undefined {
    for (const lobby of this.#store.values()) {
      if (lobby.hasUser(userId)) return lobby;
    }
  }

  #getLobby(userId: User["id"], lobbyId?: Lobby["id"]) {
    return (
      (lobbyId && this.#store.get(lobbyId)) ||
      this.#findLobbyWithUser(userId) ||
      raise(new FindLobbyError())
    );
  }

  // NOTE: IF user didn't send slotIndex (didn't specified slotIndex) THEN slotIndex === -1
  // NOTE: will throw WHEN user wanna join same lobby AND user didn't specified slotIndex
  async addUserInLobby({
    lobbyId,
    slotIndex,
    user,
  }: {
    lobbyId: Lobby["id"];
    slotIndex: number;
    user: User & { profile: UserProfile };
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

  getById(lobbyId: Lobby["id"]) {
    const lobby = this.#store.get(lobbyId);
    assert.ok(lobby);
    return lobby;
  }

  pushNewLobby({
    initiator,
    settings,
  }: {
    initiator: User & { profile: UserProfile };
    settings: InitialGameSettings;
  }) {
    const pastLobby = this.#findLobbyWithUser(initiator.id);
    if (pastLobby) {
      pastLobby.removeUser(initiator.id);
    }
    const lobby = new Lobby(settings, this.#emitter);
    lobby.insertUser(new LobbyUser(initiator), 0);
    return lobby;
  }

  removeLobby({
    initiator,
    lobbyId,
  }: {
    initiator: User & { profile: UserProfile };
    lobbyId?: Lobby["id"];
  }) {
    return this.#getLobby(initiator.id, lobbyId).deleteSelf(initiator.id);
  }

  removeUserFromLobby(leaver: User, lobbyId?: Lobby["id"]) {
    return this.#getLobby(leaver.id, lobbyId).removeUser(leaver.id);
  }

  toJSON() {
    return [...this.#store.values()];
  }

  upgradeLobbyToNonStartedGame({
    initiator,
    lobbyId,
  }: {
    initiator: User & { profile: UserProfile };
    lobbyId?: Lobby["id"];
  }) {
    return this.#getLobby(initiator.id, lobbyId).upgradeToNonStartedGame(
      // @ts-expect-error hard to type for now, ts is true here
      initiator,
    );
  }
}

class LobbyAddEvent extends CustomWebsocketEvent {
  lobby;

  constructor(lobby: Lobby) {
    super("lobby::add");
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
