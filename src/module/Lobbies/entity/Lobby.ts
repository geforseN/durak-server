import { randomUUID } from "node:crypto";
import CorrectGameSettings, { GameSettings } from "./CorrectGameSettings";
import EventEmitter from "events";
import LobbySlots from "./LobbySlots";
import assert from "node:assert";
import WebSocket from "ws";
import { getFirstTimeUser, LobbyUser as User } from "../lobbies.namespace";
import LobbyUser from "./LobbyUser";

export default class Lobby {
  id: string;
  settings: GameSettings;
  slots: LobbySlots<Awaited<ReturnType<typeof getFirstTimeUser>>>;
  emitter: EventEmitter;

  constructor({ settings }: { settings: GameSettings }) {
    this.emitter = new EventEmitter(); // TODO
    this.id = randomUUID();
    this.settings = new CorrectGameSettings(settings);
    this.slots = new LobbySlots({
      size: settings.userCount,
      emitter: this.emitter,
    });
  }

  get value() {
    return { ...this, slots: this.slots.value };
  }

  get isEmpty() {
    return this.slots.isEmpty;
  }

  get isFull() {
    return this.slots.isFull;
  }

  hasUser(cb: (user?: User) => boolean): boolean {
    return this.slots.hasUser(cb);
  }

  updateAdmin(socket: WebSocket, newAdminId?: User["id"]) {
    this.slots.admin = newAdminId ?? this.slots.mostLeftSideNonAdminUser.id;
    socket.emit("everySocket", "lobby::admin::update", {
      adminId: this.slots.admin.id,
      lobbyId: this.id,
    });
  }

  put(user: User, slotIndex = -1, socket: WebSocket) {
    assert.ok(
      !this.isFull,
      "Не получилось добавить игрока из лобби. \nЛобби полностью занято.",
    );
    slotIndex = this.slots.putUser(user, slotIndex);
    socket.emit("socket", "user::lobby::current", { lobbyId: this.id });
    socket.emit("everySocket", "lobby::user::put", {
      lobbyId: this.id,
      user,
      slotIndex,
    });
  }

  remove(cb: (user?: User) => boolean, socket: WebSocket) {
    const user = this.slots.removeUser(cb);
    socket.emit("everySocket", "lobby::user::leave", {
      lobbyId: this.id,
      userId: user.id,
    });
    if (this.isEmpty) {
      socket.emit("everySocket", "lobby::delete", { lobbyId: this.id });
    } else if (user.isAdmin) {
      this.updateAdmin(socket);
    }
    return user;
  }

  swapUser(cb: (user?: User) => boolean, slotIndex = -1, socket: WebSocket) {
    assert.ok(slotIndex !== -1, "Выберете конкретный слот для перестановки.");
    const user = this.slots.swapUser(cb, slotIndex);
    socket.emit("everySocket", "lobby::user::swap", {
      lobbyId: this.id,
      userId: user.id,
      slotIndex,
    });
    return user;
  }

  static hasUserWithSameId(this: { userId: string }, lobby: Lobby) {
    return lobby.hasUser(LobbyUser.hasSameId.bind({ id: this.userId }));
  }

  static hasSameId(this: { id: string }, lobby: Lobby) {
    return this.id === lobby.id;
  }
}

// #listenEvents() {
//   this.emitter.on("user::join", this.#listenUserJoin);
//   this.emitter.on("user::leave", this.#listenUserLeave);
//   this.emitter.on("admin::update", this.#listenAdminUpdate);
//   this.emitter.on("delete", this.#listenThisDelete);
// }
//
// #listenThisDelete() {
//   console.log("delete", this.id);
//   this.lobbiesEmitter.emit("everySocket", "lobby::delete", { lobbyId: this.id });
// }
//
//
// #listenUserJoin(user: __LobbyUser, slotIndex: number) {
//   console.log("user::join", this.id, user.nickname, slotIndex);
//   this.lobbiesEmitter.emit("everySocket", "lobby::user::join", {
//     lobbyId: this.id,
//     user,
//     slotIndex,
//   });
// }
//
// #listenUserLeave(user: __LobbyUser, slotIndex: number) {
//   console.log("user::leave", this.id, user.nickname, slotIndex);
//   this.lobbiesEmitter.emit("everySocket", "lobby::user::leave", {
//     lobbyId: this.id,
//     user,
//     slotIndex,
//   });
// }
//
// #listenAdminUpdate(admin: __LobbyUser) {
//   console.log("admin::update", this.id, admin.nickname);
//   this.lobbiesEmitter.emit("everySocket", "lobby::admin::update", {
//     lobbyId: this.id,
//     adminId: admin.id,
//   });
// }