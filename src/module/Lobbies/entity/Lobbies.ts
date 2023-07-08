import Lobby from "./Lobby";
import EventEmitter from "events";
import assert from "node:assert";
import { getFirstTimeUser } from "../lobbies.namespace";
import { durakGames } from "../../..";
import { UnstartedGame } from "../../DurakGame/NonstartedDurakGame";
import { GameSettings } from "./CorrectGameSettings";
import { LobbyAccessError, DeleteLobbyError, FindLobbyError } from "../error";

export default class Lobbies {
  readonly value: Lobby[];
  readonly emitter: EventEmitter;

  constructor(emitter: EventEmitter, value: Lobby[] = []) {
    this.emitter = emitter;
    this.value = value;
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

  addUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    const pastLobby = this.value.find((lobby) =>
      lobby.has((user) => user?.id === userId),
    );
    const desiredLobby = this.#get((lobby) => lobby.id === lobbyId);
    assert.ok(
      !desiredLobby.isFull,
      new LobbyAccessError("Лобби полностью занято"),
    );
    if (pastLobby === desiredLobby) {
      // ! slotIndex can be -1 here !
      // ? how should it work then ?
      // UPD: moveUser method will throw on slot.isValid assert
      return desiredLobby.moveUser(userId, slotIndex);
    }
    if (pastLobby) {
      const user = pastLobby.removeUser(userId);
      return desiredLobby.insertUser(user, slotIndex);
    }
    return getFirstTimeUser(userId).then((user) =>
      desiredLobby.insertUser(user, slotIndex),
    );
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
    assert.ok(lobby.admin.id === userId, new LobbyAccessError());
    durakGames.set(lobby.id, new UnstartedGame(lobby));
  }

  removeLobby(userId: string, lobbyId?: string) {
    const lobbyIndex = this.#getLobbyIndex(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
    assert.ok(lobbyIndex > 0, new DeleteLobbyError());
    const lobby = this.value[lobbyIndex];
    assert.ok(lobby.admin.id === userId, new LobbyAccessError());
    this.value.splice(lobbyIndex, 1);
    this.emitter.emit("everySocket", "lobby::remove", { lobbyId: lobby.id });
  }

  removeUserFromLobby(userId: string, lobbyId?: string) {
    const lobby = this.#get(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
    return lobby.removeUser(userId);
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
}
