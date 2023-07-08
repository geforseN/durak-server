import Lobby from "./Lobby";
import EventEmitter from "events";
import assert from "node:assert";
import { getFirstTimeUser } from "../lobbies.namespace";
import { GameSettings } from "./CorrectGameSettings";
import { LobbyAccessError, FindLobbyError } from "../error";

export default class Lobbies {
  readonly #emitter: EventEmitter;
  readonly #map: Map<string, Lobby>;

  constructor(emitter: EventEmitter, map = new Map<string, Lobby>()) {
    this.#emitter = emitter;
    this.#map = map;
  }

  restoreState() {
    return { lobbies: [...this.#map.values()] };
  }

  async addUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    const desiredLobby = this.#map.get(lobbyId) || raise(new FindLobbyError());
    assert.ok(
      !desiredLobby.isFull,
      new LobbyAccessError("Лобби полностью занято"),
    );
    const pastLobby = this.#findLobby(userId);
    if (pastLobby === desiredLobby) {
      return desiredLobby.moveUser(userId, slotIndex);
    }
    const user = pastLobby
      ? pastLobby.removeUserWithEmit(userId)
      : await getFirstTimeUser(userId);
    return desiredLobby.insertUser(user, slotIndex);
  }

  pushNewLobby(settings: GameSettings) {
    const lobby = new Lobby({ settings, lobbiesEmitter: this.#emitter });
    this.#map.set(lobby.id, lobby);
    this.#emitter.emit("everySocket", "lobby::add", { lobby });
  }

  upgrateLobbyToUnstartedGame(
    userId: string,
    lobbyId = this.#getLobbyId(userId),
  ) {
    const lobby = this.#map.get(lobbyId) || raise();
    lobby.tryUpdateToUnstartedGame(userId);
    // TODO in Vue:
    // FOR unstarted game users UPDATE their state: SET gameId to lobbyId
    this.#map.delete(lobby.id);
    this.#emitter.emit("everySocket", "lobby::remove", { lobbyId: lobby.id });
  }

  removeLobby(userId: string, lobbyId = this.#getLobbyId(userId)) {
    const lobby = this.#map.get(lobbyId) || raise();
    assert.ok(lobby.admin.id === userId, new LobbyAccessError());
    this.#emitter.emit("everySocket", "lobby::remove", { lobbyId });
    // TODO in Vue:
    // FOR deleted users UPDATE their state: SET lobbyId to null
  }

  removeUserFromLobby(userId: string, lobbyId = this.#getLobbyId(userId)) {
    const lobby = this.#map.get(lobbyId) || raise();
    lobby.removeUserWithEmit(userId);
  }

  #getLobbyId(userId: string): string | never {
    return this.#findLobby(userId)?.id || raise();
  }

  #getLobby(userId: string): Lobby | never {
    return this.#findLobby(userId) || raise();
  }

  #findLobby(userId: string): Lobby | undefined {
    for (const lobby of this.#map.values()) {
      if (lobby.hasUser(userId)) return lobby;
    }
  }
}

function raise(err = new Error()): never {
  throw err;
}
