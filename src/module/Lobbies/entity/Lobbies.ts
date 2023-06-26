import Lobby from "./Lobby";
import EventEmitter from "events";
import assert from "node:assert";
import WebSocket from "ws";
import { LobbyUser } from "../lobbies.namespace";

export default class Lobbies {
  readonly #value: Lobby[];
  readonly #emitter: EventEmitter;

  constructor(emitter: EventEmitter, value: Lobby[] = []) {
    this.#value = value;
    this.#emitter = emitter;
  }

  get value() {
    return this.#value.map((lobby) => lobby.value);
  }

  push(lobby: Lobby, socket: WebSocket) {
    this.#addLobby(lobby);
    socket.emit("everySocket", "lobby::add", { lobby });
    this.#emitter.emit("everySocket", "lobby::add", { lobbyId: lobby.id });
    return lobby;
  }

  remove(cb: (lobby: Lobby) => boolean, socket: WebSocket) {
    const [lobby] = this.#removeLobby(cb);
    socket.emit("everySocket", "lobby::remove", { lobbyId: lobby.id });
    this.#emitter.emit("everySocket", "lobby::remove", { lobbyId: lobby.id });
    return lobby;
  }

  async find(cb: (lobby: Lobby) => boolean) {
    return this.#value[this.#getLobbyIndex(cb)];
  }

  hasUser(cb: (user?: LobbyUser) => boolean) {
    return this.#value.some((lobby) => lobby.hasUser(cb));
  }

  #addLobby(lobby: Lobby) {
    return this.#value.push(lobby);
  }

  #removeLobby(cb: (lobby: Lobby) => boolean) {
    return this.#value.splice(this.#getLobbyIndex(cb), 1);
  }

  #getLobbyIndex(cb: (lobby: Lobby) => boolean) {
    const index = this.#value.findIndex(cb);
    assert.ok(index !== -1, "Лобби с данным идентификатором не найдено.");
    return index;
  }
}

export interface IGameLobbyUser {
  id: string;
  isAdmin: boolean;
  nickname: string;
}

interface ILobby<GameLobbyUser> {
  get value(): any;

  id: string;

  hasUser(cb: (user?: GameLobbyUser) => boolean): boolean;

  putUser(user: GameLobbyUser, slotIndex: number): any;

  removeUser(cb: (user?: GameLobbyUser) => boolean): GameLobbyUser;

  swapUser(cb: (user?: GameLobbyUser) => boolean, slotIndex: number): boolean;

  slots: {
    get value(): (GameLobbyUser | undefined)[];
  };
}
