import Lobby from "./Lobby";
import EventEmitter from "events";
import { getFirstTimeUser } from "../lobbies.namespace";
import { GameSettings } from "./CorrectGameSettings";
import { FindLobbyError } from "../error";
import { raise } from "../../..";

export default class Lobbies {
  readonly #emitter: EventEmitter;
  readonly #map: Map<string, Lobby>;

  constructor(emitter: EventEmitter, map = new Map<string, Lobby>()) {
    this.#emitter = emitter;
    this.#map = map;
    this.#emitter
      .on("lobby##remove", ({ lobbyId }) => {
        this.#map.delete(lobbyId);
        this.#emitter.emit("everySocket", "lobby::remove", { lobbyId });
      })
      .on("lobby##add", ({ lobby }) => {
        this.#map.set(lobby.id, lobby);
        this.#emitter.emit("everySocket", "lobby::add", { lobby });
      });
  }

  restoreState() {
    return { lobbies: [...this.#map.values()] };
  }

  async addUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    const desiredLobby = this.#map.get(lobbyId) || raise(new FindLobbyError());
    desiredLobby.assertSlotIndex(slotIndex);
    desiredLobby.ensureCanJoin(userId, slotIndex);
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
    return new Lobby({ settings, lobbiesEmitter: this.#emitter });
  }

  upgrateLobbyToUnstartedGame(userId: string, lobbyId?: Lobby["id"]) {
    const lobby = this.#getLobbyOrThrow(userId, lobbyId);
    lobby.ensureIsAdmin(userId);
    lobby.updateToUnstartedGame();
    // TODO in Vue:
    // FOR unstarted game users UPDATE their state: SET gameId to lobbyId
  }

  removeLobby(userId: string, lobbyId?: Lobby["id"]) {
    const lobby = this.#getLobbyOrThrow(userId, lobbyId);
    lobby.ensureIsAdmin(userId);
    this.#emitter.emit("lobby##remove", { lobbyId: lobby.id });
    // TODO in Vue:
    // FOR deleted users UPDATE their state: SET lobbyId to null
  }

  removeUserFromLobby(userId: string, lobbyId?: Lobby["id"]) {
    const lobby = this.#getLobbyOrThrow(userId, lobbyId);
    lobby.removeUser(userId);
  }

  #getLobbyOrThrow(userId: string, lobbyId?: Lobby["id"]) {
    return (
      (lobbyId && this.#map.get(lobbyId)) ||
      this.#findLobbyWithUser(userId) ||
      raise(new FindLobbyError())
    );
  }

  #findLobbyWithUser(userId: string): Lobby | undefined {
    for (const lobby of this.#map.values()) {
      if (lobby.hasUser(userId)) return lobby;
    }
  }
}
