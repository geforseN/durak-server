import { randomUUID } from "node:crypto";
import CorrectGameSettings, { GameSettings } from "./CorrectGameSettings";
import EventEmitter from "events";
import LobbySlots from "./LobbySlots";
import assert from "node:assert";
import { getFirstTimeUser, LobbyUser as User } from "../lobbies.namespace";

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
    return { id: this.id, settings: this.settings, slots: this.slots.value };
  }

  get isEmpty() {
    return this.slots.isEmpty;
  }

  get isFull() {
    return this.slots.isFull;
  }

  has(cb: (user?: User) => boolean): boolean {
    return this.slots.has(cb);
  }

  get(cb: (user?: User) => boolean) {
    return this.slots;
  }

  get admin() {
    return this.slots.admin;
  }

  updateAdmin() {
    this.slots.admin = this.slots.mostLeftSideNonAdminUser;
    this.emitter.emit("everySocket", "lobby::admin::update", {
      adminId: this.slots.admin.id,
      lobbyId: this.id,
    });
  }

  bestUpdateAdmin(emitter: EventEmitter) {
    this.slots.admin = this.slots.mostLeftSideNonAdminUser;
    emitter.emit("everySocket", "lobby::admin::update", {
      adminId: this.slots.admin.id,
      lobbyId: this.id,
    });
  }

  put(user: User, slotIndex = -1) {
    assert.ok(
      !this.isFull,
      "Не получилось добавить игрока из лобби. \nЛобби полностью занято.",
    );
    slotIndex = this.slots.putUser(user, slotIndex);
    this.emitter.emit("lobby::user::put", {
      lobbyId: this.id,
      user,
      slotIndex,
    });
  }

  remove(cb: (user?: User) => boolean) {
    const user = this.slots.remove(cb);
    this.emitter.emit("lobby::user::leave", {
      lobbyId: this.id,
      userId: user.id,
    });
    if (this.isEmpty) {
      this.emitter.emit("lobby::delete", { lobbyId: this.id });
    } else if (user.isAdmin) {
      this.updateAdmin();
    }
    return user;
  }

  bestRemove(userId: string, emitter: EventEmitter) {
    const user = this.slots.remove((user) => user?.id === userId);
    if (this.isEmpty) {
      emitter.emit("everySocket", "lobby::delete", {
        lobbyId: this.id,
      });
    } else if (user.isAdmin) {
      this.bestUpdateAdmin(emitter);
    }
  }

  move(cb: (user?: User) => boolean, slotIndex = -1) {
    assert.ok(slotIndex !== -1, "Выберете конкретный слот для перестановки.");
    const user = this.slots.move(cb, slotIndex);
    this.emitter.emit("lobby::user::move", {
      lobbyId: this.id,
      userId: user.id,
      slotIndex,
    });
    return user;
  }
}
