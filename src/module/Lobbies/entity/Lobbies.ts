import Lobby from "./Lobby";
import EventEmitter from "events";
import assert from "node:assert";
import { getFirstTimeUser } from "../lobbies.namespace";
import { GameSettings } from "./CorrectGameSettings";
import { LobbyAccessError, DeleteLobbyError, FindLobbyError } from "../error";

export default class Lobbies {
  readonly value: Lobby[];
  readonly emitter: EventEmitter;
  readonly map: Map<string, Lobby>;

  constructor(emitter: EventEmitter, value: Lobby[] = []) {
    this.emitter = emitter;
    this.value = value;
    this.map = new Map();
  }

  async restoreState(userId: string) {
    return {
      lobbies: this.value.map((lobby) => lobby.value),
      lobbyId:
        userId &&
        this.value.find((lobby) => lobby.has((user) => user?.id === userId))
          ?.id,
    };
  }

  async addUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    const desiredLobby = this.#getLobbyWithId(lobbyId);
    assert.ok(
      !desiredLobby.isFull,
      new LobbyAccessError("Лобби полностью занято"),
    );
    const pastLobby = this.#findLobbyWithUser(userId);
    if (pastLobby === desiredLobby) {
      return desiredLobby.moveUser(userId, slotIndex);
    }
    const user = pastLobby
      ? pastLobby.removeUser(userId)
      : await getFirstTimeUser(userId);
    return desiredLobby.insertUser(user, slotIndex);
  }

  pushNewLobby(settings: GameSettings) {
    const lobby = new Lobby({ settings, lobbiesEmitter: this.emitter });
    this.value.push(lobby);
    this.emitter.emit("everySocket", "lobby::add", { lobby });
  }

  upgrateLobbyToUnstartedGame(userId: string, lobbyId?: string) {
    const lobby = this.#get(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
    lobby.updateToUnstartedGame(userId);
    // TODO in Vue:
    // FOR unstarted game users UPDATE their state: SET gameId to lobbyId
    this.removeLobby(userId, lobbyId);
  }

  removeLobby(userId: string, lobbyId?: string) {
    const lobbyIndex = this.#getLobbyIndex(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
      new DeleteLobbyError(),
    );
    const lobby = this.value[lobbyIndex];
    assert.ok(lobby.admin.id === userId, new LobbyAccessError());
    this.value.splice(lobbyIndex, 1);
    this.emitter.emit("everySocket", "lobby::remove", { lobbyId: lobby.id });
    // TODO in Vue:
    // FOR deleted users UPDATE their state: SET lobbyId to null
  }

  removeUserFromLobby(userId: string, lobbyId?: string) {
    return this.#getLobbySomehow(userId, lobbyId).removeUser(userId);
  }

  #get(
    cb: (lobby: Lobby) => boolean,
    message: Error | string = new FindLobbyError(),
  ): Lobby | never {
    const lobby = this.value.find(cb);
    assert.ok(lobby, message);
    return lobby;
  }

  #getLobbyIndex(
    cb: (lobby: Lobby) => boolean,
    message: Error | string = new FindLobbyError(),
  ) {
    const index = this.value.findIndex(cb);
    assert.ok(index > 0, message);
    return index;
  }

  #findLobbyWithUser(userId: string) {
    return this.value.find((lobby) => lobby.has((user) => user?.id === userId));
  }

  #getLobbyWithId(lobbyId: Lobby["id"]) {
    return this.#get((lobby) => lobby.id === lobbyId);
  }

  #getLobbySomehow(userId: string, lobbyId?: Lobby["id"]) {
    return this.#get(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
  }
}
