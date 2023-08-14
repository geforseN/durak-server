import type { User, UserProfile } from "@prisma/client";
import type EventEmitter from "events";
import { durakGames, raise } from "../../..";
import { CustomWebsocketEvent } from "../../../ws";
import { FindLobbyError } from "../error";
import type { GameSettings } from "./CorrectGameSettings";
import Lobby from "./Lobby";
import LobbyUser from "./LobbyUser";
import assert from "node:assert";
import { NonStartedDurakGame } from "../../DurakGame/NonStartedDurakGame";

export default class Lobbies {
  readonly #emitter: EventEmitter;
  readonly #map: Map<Lobby["id"], Lobby>;

  constructor(emitter: EventEmitter, map = new Map<Lobby["id"], Lobby>()) {
    this.#emitter = emitter;
    this.#map = map;
    this.#emitter
      .on("lobby##remove", ({ lobbyId }) => {
        this.#map.delete(lobbyId);
        this.#emitter.emit("everySocket", new LobbyRemoveEvent(lobbyId));
      })
      .on("lobby##add", ({ lobby }) => {
        this.#map.set(lobby.id, lobby);
        this.#emitter.emit("everySocket", new LobbyAddEvent(lobby));
      })
      .on("lobby##upgrade", ({ lobby }: { lobby: Lobby }) => {
        durakGames.set(lobby.id, new NonStartedDurakGame(lobby));
        // TODO emit lobby users than lobby upgraded
      });
  }

  *[Symbol.iterator]() {
    yield* [...this.#map.values()].map((lobby) => lobby.toString());
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
      this.#map.get(lobbyId) || raise(new FindLobbyError()),
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

  // TODO in Vue: FOR not started game users UPDATE their state: SET gameId to lobbyId
  upgradeLobbyToNonStartedGame({
    initiator,
    lobbyId,
  }: {
    lobbyId?: Lobby["id"];
    initiator: User & { profile: UserProfile };
  }) {
    return this.#getLobby(initiator.id, lobbyId).upgradeToNonStartedGame(
      initiator.id,
    );
  }

  // TODO in Vue: FOR deleted users UPDATE their state: SET lobbyId to null
  removeLobby({
    initiator,
    lobbyId,
  }: {
    lobbyId?: Lobby["id"];
    initiator: User & { profile: UserProfile };
  }) {
    return this.#getLobby(initiator.id, lobbyId).deleteSelf(initiator.id);
  }

  removeUserFromLobby(userId: User["id"], lobbyId?: Lobby["id"]) {
    return this.#getLobby(userId, lobbyId).removeUser(userId);
  }

  #getLobby(userId: User["id"], lobbyId?: Lobby["id"]) {
    return (
      (lobbyId && this.#map.get(lobbyId)) ||
      this.#findLobbyWithUser(userId) ||
      raise(new FindLobbyError())
    );
  }

  #findLobbyWithUser(userId: User["id"]): Lobby | undefined {
    for (const lobby of this.#map.values()) {
      if (lobby.hasUser(userId)) return lobby;
    }
  }
}

class LobbyAddEvent extends CustomWebsocketEvent {
  lobby;

  constructor(lobby: Lobby) {
    super("lobby::add");
    this.lobby = {
      ...lobby,
      slots: lobby.slots.value,
      lobbiesEmitter: undefined,
    };
  }
}

class LobbyRemoveEvent extends CustomWebsocketEvent {
  constructor(public lobbyId: Lobby["id"]) {
    super("lobby::remove");
  }
}
