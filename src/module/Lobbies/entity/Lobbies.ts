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

  get state() {
    return { lobbies: [...this.#map.values()] };
  }

  // NOTE: IF user didn't send slotIndex (didn't specified slotIndex) THEN slotIndex === -1
  // NOTE: will throw WHEN user wanna join same lobby AND user didn't specified slotIndex
  async addUserInLobby(userId: string, lobbyId: string, slotIndex: number) {
    const [pastLobby, desiredLobby] = [
      this.#findLobbyWithUser(userId),
      this.#map.get(lobbyId) || raise(new FindLobbyError()),
    ];
    if (!pastLobby) {
      return desiredLobby.insertUser(await getFirstTimeUser(userId), slotIndex);
    }
    if (pastLobby === desiredLobby) {
      return desiredLobby.moveUser(userId, slotIndex);
    }
    return desiredLobby.pickUserFrom(pastLobby, userId, slotIndex);
  }

  pushNewLobby(settings: GameSettings) {
    return new Lobby(settings, this.#emitter);
  }

  // TODO in Vue: FOR not started game users UPDATE their state: SET gameId to lobbyId
  upgradeLobbyToNonStartedGame(userId: string, lobbyId?: Lobby["id"]) {
    return this.#getLobbyOrThrow(userId, lobbyId).upgradeToNonStartedGame(userId);
  }

  // TODO in Vue: FOR deleted users UPDATE their state: SET lobbyId to null
  removeLobby(userId: string, lobbyId?: Lobby["id"]) {
    return this.#getLobbyOrThrow(userId, lobbyId).deleteSelf(userId);
  }

  removeUserFromLobby(userId: string, lobbyId?: Lobby["id"]) {
    return this.#getLobbyOrThrow(userId, lobbyId).removeUser(userId);
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
