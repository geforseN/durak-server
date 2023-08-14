import assert from "node:assert";
import crypto from "node:crypto";
import type EventEmitter from "node:events";
import CorrectGameSettings, { type GameSettings } from "./CorrectGameSettings";
import LobbySlots from "./LobbySlots";
import { LobbyAccessError } from "../error";
import { CustomWebsocketEvent } from "../../../ws";
import LobbyUser from "./LobbyUser";

export default class Lobby {
  id: string;
  settings: GameSettings;
  slots: LobbySlots;
  #lobbiesEmitter: EventEmitter;

  constructor(settings: GameSettings, lobbiesEmitter: EventEmitter) {
    this.settings = new CorrectGameSettings(settings);
    this.#lobbiesEmitter = lobbiesEmitter;
    this.id = crypto.randomUUID();
    this.slots = new LobbySlots(settings.userCount);
    this.#lobbiesEmitter.emit("lobby##add", { lobby: this });
    // TODO: this.emptySlots = new EmptySlotsOfLobby(this)
    // TODO: this.users = new UsersOfLobby(this)
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      settings: this.settings,
      slots: this.slots.value,
    });
  }

  get isEmpty() {
    return this.slots.isEmpty;
  }

  get isFull() {
    return this.slots.isFull;
  }

  get admin() {
    return this.slots.admin;
  }

  hasUser(userId: string) {
    return this.slots.hasUser(userId);
  }

  insertUser(user: LobbyUser, slotIndex: number) {
    const finalSlotIndex =
      slotIndex === -1 ? this.slots.firstFoundEmptySlot.index : slotIndex;
    const filledSlot = this.slots.insertUser(user, finalSlotIndex);
    this.#lobbiesEmitter.emit(
      "everySocket",
      new UserJoinEvent(this.id, filledSlot.user, filledSlot.index),
    );
    return true;
  }

  upgradeToNonStartedGame(upgradeInitiatorId: string): void {
    assert.ok(this.admin.id === upgradeInitiatorId, new LobbyAccessError());
    this.#lobbiesEmitter.emit("lobby##upgrade", { lobby: this });
  }

  removeUser(userId: string): LobbyUser {
    const removedUser = this.slots.removeUser(userId);
    this.#lobbiesEmitter.emit("lobby::user::remove", {
      lobbyId: this.id,
      userId: removedUser.id,
    });
    if (this.isEmpty) {
      this.#lobbiesEmitter.emit("lobby##remove", {
        lobbyId: this.id,
      });
    } else if (removedUser.isAdmin) {
      this.slots.admin = this.slots.mostLeftSideNonAdminUser;
      this.#lobbiesEmitter.emit(
        "everySocket",
        new UserAdminUpdate(this.id, this.admin.id),
      );
    }
    return removedUser;
  }

  moveUser(userId: string, newSlotIndex: number): number {
    assert.ok(newSlotIndex !== -1, "Вас следует указать определённый индекс");
    assert.ok(
      Number.isInteger(newSlotIndex) &&
        newSlotIndex >= 0 &&
        newSlotIndex < this.settings.userCount,
    );
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    const [newSlot, oldSlot] = [
      this.slots.getEmptySlotAt(newSlotIndex),
      this.slots.getSlotOfUser(userId),
    ];
    this.slots.swapValues(oldSlot, newSlot);
    this.#lobbiesEmitter.emit(
      "everySocket",
      new UserMoveEvent(this.id, userId, newSlot.index, oldSlot.index),
    );
    return oldSlot.index;
  }

  // TODO add emit decorator
  pickUserFrom(lobby: Lobby, userId: string, slotIndex: number) {
    const finalSlotIndex =
      slotIndex === -1 ? this.slots.firstFoundEmptySlot.index : slotIndex;
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    assert.ok(
      this.slots.at(finalSlotIndex).isEmpty,
      new LobbyAccessError("Желаемый слот занят"),
    );
    return this.insertUser(lobby.removeUser(userId), finalSlotIndex);
  }

  deleteSelf(initiatorId: string) {
    assert.ok(this.admin.id === initiatorId, new LobbyAccessError());
    this.#lobbiesEmitter.emit("lobby##remove", { lobbyId: this.id });
  }
}

class UserJoinEvent extends CustomWebsocketEvent {
  lobbyId;
  user;
  slotIndex;

  constructor(lobbyId, user, slotIndex) {
    super("lobby::user::join");
    this.lobbyId = lobbyId;
    this.user = user;
    this.slotIndex = slotIndex;
  }
}

class UserMoveEvent extends CustomWebsocketEvent {
  lobbyId;
  userId;
  newSlotIndex;
  pastSlotIndex;

  constructor(lobbyId, userId, newSlotIndex, oldSlotIndex) {
    super("lobby::user::move");
    this.lobbyId = lobbyId;
    this.userId = userId;
    this.newSlotIndex = newSlotIndex;
    this.pastSlotIndex = oldSlotIndex;
  }
}

class UserAdminUpdate extends CustomWebsocketEvent {
  lobbyId;
  adminId;

  constructor(lobbyId, adminId) {
    super("lobby::admin::update");
    this.lobbyId = lobbyId;
    this.adminId = adminId;
  }
}
