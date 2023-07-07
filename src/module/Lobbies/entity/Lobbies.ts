import Lobby from "./Lobby";
import EventEmitter from "events";
import assert from "node:assert";
import { getFirstTimeUser } from "../lobbies.namespace";
import { durakGames } from "../../..";
import { UnstartedGame } from "../../DurakGame/NonstartedDurakGame";
import { GameSettings } from "./CorrectGameSettings";

export default class Lobbies {
  readonly value: Lobby[];
  readonly emitter: EventEmitter;

  constructor(emitter: EventEmitter, value: Lobby[] = []) {
    this.emitter = emitter;
    this.value = value;
  }

  get #state() {
    return this.value.map((lobby) => lobby.value);
  }

  async restoreState(userId: string) {
    return {
      lobbies: this.#state,
      lobbyId:
        userId &&
        (await this.#get((lobby) =>
          lobby.has((user) => user?.id === userId),
        ).then(
          (lobby) => lobby.id,
          () => undefined,
        )),
    };
  }
  
  async addUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    if (!this.value.some((lobby) => lobby.has((user) => user?.id === userId))) {
      const [lobby, user] = await Promise.all([
        this.#get((lobby) => lobby.id === lobbyId),
        getFirstTimeUser(userId),
      ]);
      lobby.put(user, slotIndex);
      return this.emitter.emit("socket", "user::lobby::current", {
        lobbyId: lobby.id,
      });
    }
    const [oldLobby, lobby] = await Promise.all([
      this.#get((lobby) => lobby.has((user) => user?.id === userId)),
      this.#get((lobby) => lobby.id === lobbyId),
    ]);
    if (lobby === oldLobby) {
      return lobby.move((user) => user?.id === userId, slotIndex);
    }
    const user = oldLobby.remove((user) => user?.id === userId);
    lobby.put(user, slotIndex);
    return this.emitter.emit("socket", "user::lobby::current", {
      lobbyId: lobby.id,
    });
  }

  async addddUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    const desiredLobby = await this.#get((lobby) => lobby.id === lobbyId);
    assert.ok(
      !desiredLobby.isFull,
      new NoAccessError("Лобби полностью занято"),
    );
    assert.ok(
      !desiredLobby.has((user) => user?.id === userId),
      "Вы уже в этом лобби",
    );
    const pastLobby = await this.#get((lobby) =>
      lobby.has((user) => user?.id === userId),
    );
    if (!pastLobby) {
      const user = await getFirstTimeUser(userId);
      return desiredLobby.bestInsertUser(user, slotIndex, this.emitter);
    }
    const user = pastLobby.bestRemoveUser (userId, this.emitter)
    // ELSE remove user AND IF remove user IS admin THEN change admin AND ID pastLobby is empty THEN remove lobby
  }

  pushNewLobby(settings: GameSettings) {
    const lobby = new Lobby({ settings });
    this.value.push(lobby);
    this.emitter.emit("everySocket", "lobby::add", { lobby });
    return lobby;
  }

  async updateLobbyToUnstartedGame(userId: string, lobbyId?: string) {
    const lobby = await this.#get(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
    assert.ok(lobby.admin.id === userId, new NoAccessError());
    durakGames.set(lobby.id, new UnstartedGame(lobby));
  }

  removeLobby(userId: string, lobbyId?: string) {
    const lobbyIndex = this.#getLobbyIndex(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
    assert.ok(lobbyIndex > 0, new NoLobbyError());
    const lobby = this.value[lobbyIndex];
    assert.ok(lobby.admin.id === userId, new NoAccessError());
    this.value.splice(lobbyIndex, 1);
    this.emitter.emit("everySocket", "lobby::remove", { lobbyId: lobby.id });
  }

  async removeUserFromLobby(userId: string, lobbyId?: string) {
    const lobby = await this.#get(
      lobbyId
        ? (lobby) => lobby.id === lobbyId
        : (lobby) => lobby.has((user) => user?.id === userId),
    );
    return lobby.bestRemove(userId, this.emitter);
  }

  async #get(cb: (lobby: Lobby) => boolean): Promise<Lobby> | never {
    return this.value[this.#getLobbyIndex(cb)];
  }

  #getLobbyIndex(cb: (lobby: Lobby) => boolean) {
    const index = this.value.findIndex(cb);
    assert.ok(index > 0, new NoLobbyError());
    return index;
  }
}

class NoLobbyError extends Error {
  constructor() {
    super("Нет такого лобби");
    this.name = "Ошибка удаления лобби";
  }
}

class NoAccessError extends Error {
  constructor(message?: string) {
    super(message || "Вы не являетесь админом лобби");
    this.name = "Ошибка доступа";
  }
}
