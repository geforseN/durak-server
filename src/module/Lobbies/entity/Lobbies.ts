import type { User } from "@prisma/client";
import type EventEmitter from "events";
import { raise } from "../../..";
import { CustomWebsocketEvent } from "../../../ws";
import { FindLobbyError } from "../error";
import type { GameSettings } from "./CorrectGameSettings";
import Lobby from "./Lobby";
import LobbyUser from "./LobbyUser";

export default class Lobbies {
  readonly #emitter: EventEmitter;
  readonly #map: Map<string, Lobby>;

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
      });
  }

  get state() {
    return { lobbies: [...this.#map.values()] };
  }

  // NOTE: IF user didn't send slotIndex (didn't specified slotIndex) THEN slotIndex === -1
  // NOTE: will throw WHEN user wanna join same lobby AND user didn't specified slotIndex
  async addUserInLobby(user: User, lobbyId: Lobby["id"], slotIndex: number) {
    const [pastLobby, desiredLobby] = [
      this.#findLobbyWithUser(user.id),
      this.#map.get(lobbyId) || raise(new FindLobbyError()),
    ];
    if (!pastLobby) {
      // TODO rework class LobbyUser
      // new LobbyUser(session);
      user = new LobbyUser();
      return desiredLobby.insertUser(user, slotIndex);
    }
    if (pastLobby === desiredLobby) {
      return desiredLobby.moveUser(user.id, slotIndex);
    }
    return desiredLobby.pickUserFrom(pastLobby, user.id, slotIndex);
  }

  pushNewLobby(settings: GameSettings, initiator: User) {
    const lobby = new Lobby(settings, this.#emitter);
    lobby.insertUser(initiator, 0);
    return lobby;
  }

  // TODO in Vue: FOR not started game users UPDATE their state: SET gameId to lobbyId
  upgradeLobbyToNonStartedGame(userId: User["id"], lobbyId?: Lobby["id"]) {
    return this.#getLobby(userId, lobbyId).upgradeToNonStartedGame(userId);
  }

  // TODO in Vue: FOR deleted users UPDATE their state: SET lobbyId to null
  removeLobby(lobbyId: Lobby["id"] | undefined, initiator: User) {
    return this.#_getLobbyOrThrow(lobbyId, initiator).deleteSelf(initiator.id);
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

  #_getLobbyOrThrow(lobbyId: Lobby["id"] | undefined, user: User) {
    return (
      (lobbyId && this.#map.get(lobbyId)) ||
      this.#findLobbyWithUser(user.id) ||
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
      lobbiesEmitter: undefined,
    };
  }
}

class LobbyRemoveEvent extends CustomWebsocketEvent {
  constructor(public lobbyId: Lobby["id"]) {
    super("lobby::remove");
  }
}
