import assert from "node:assert";
import crypto from "node:crypto";
import CorrectGameSettings, { type GameSettings } from "./CorrectGameSettings";
import type EventEmitter from "events";
import LobbySlots from "./LobbySlots";
import { getFirstTimeUser, type LobbyUser } from "../lobbies.namespace";

export default class Lobby {
  id: string;
  settings: GameSettings;
  slots: LobbySlots<Awaited<ReturnType<typeof getFirstTimeUser>>>;
  lobbiesEmitter: EventEmitter;

  constructor({
    settings,
    lobbiesEmitter: bestEmitter,
  }: {
    settings: GameSettings;
    lobbiesEmitter: EventEmitter;
  }) {
    this.lobbiesEmitter = bestEmitter;
    this.id = crypto.randomUUID();
    this.settings = new CorrectGameSettings(settings);
    this.slots = new LobbySlots({
      size: settings.userCount,
      emitter: this.lobbiesEmitter,
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

  has(cb: (user?: LobbyUser) => boolean): boolean {
    return this.slots.has(cb);
  }

  get admin() {
    return this.slots.admin;
  }

  updateAdmin() {
    this.slots.admin = this.slots.mostLeftSideNonAdminUser;
    this.lobbiesEmitter.emit("everySocket", "lobby::admin::update", {
      adminId: this.slots.admin.id,
      lobbyId: this.id,
    });
  }

  insertUser(user: LobbyUser, slotIndex: number) {
    const filledSlotIndex = this.slots.putUser(user, slotIndex);
    this.lobbiesEmitter.emit("lobby::user::put", {
      lobbyId: this.id,
      user,
      slotIndex: filledSlotIndex,
    });
  }

  removeUser(userId: string) {
    const user = this.slots.remove((user) => user?.id === userId);
    if (this.isEmpty) {
      this.lobbiesEmitter.emit("everySocket", "lobby::delete", {
        lobbyId: this.id,
      });
    } else if (user.isAdmin) {
      this.updateAdmin();
    }
    return user;
  }

  moveUser(userId: string, desiredSlotIndex: number) {
    const currentSlotIndex = this.slots.findSlotIndex(
      (user) => user?.id === userId,
    );
    assert.ok(
      currentSlotIndex !== desiredSlotIndex,
      "Данный слот уже занят вами",
    );
    const slot = this.slots.slotAt(desiredSlotIndex);
    assert.ok(slot.isValid && slot.isEmpty);
    this.slots.swap(currentSlotIndex, desiredSlotIndex);
    this.lobbiesEmitter.emit("everySocket", "lobby::user::move", {
      lobbyId: this.id,
      userId,
      newSlotIndex: desiredSlotIndex,
      // NOTE: property below can be omited
      pastSlotIndex: currentSlotIndex,
    });
  }
}
