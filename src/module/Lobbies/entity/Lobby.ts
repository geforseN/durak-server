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

  toJSON() {
    return JSON.stringify({ ...this });
  }

  get userSlots() {
    return this.slots.userSlots;
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
    this.#lobbiesEmitter;
    this.#lobbiesEmitter.emit("lobby##user##join", {
      lobby: this,
      slot: filledSlot,
    });
  }

  upgradeToNonStartedGame(initiator: LobbyUser): void {
    assert.ok(this.admin.id === initiator.id, new LobbyAccessError());
    assert.ok(this.isFull, "Каждый слот должен быть заполнен игроком");
    this.#lobbiesEmitter.emit("lobby##upgrade", { lobby: this });
  }

  removeUser(userId: string): LobbyUser {
    if (this.admin.id === userId) {
      if (this.slots.usersCount === 1) {
        this.slots.admin.isAdmin = false;
      } else {
        this.slots.admin = this.slots.mostLeftSideNonAdminUser;
        this.#lobbiesEmitter.emit("lobby##admin##update", { lobby: this });
      }
    }
    const removedUser = this.slots.removeUser(userId);
    this.#lobbiesEmitter.emit("lobby##user##leave", {
      lobby: this,
      user: removedUser,
    });
    if (this.isEmpty) {
      this.#lobbiesEmitter.emit("lobby##remove", {
        lobby: this,
      });
    }
    return removedUser;
  }

  moveUser(userId: string, newSlotIndex: number) {
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
    this.slots.moveUser(oldSlot, newSlot);
    this.#lobbiesEmitter.emit("lobby##user##move", {
      lobby: this,
      newSlot,
      oldSlot,
    });
  }

  pickUserFrom(lobby: Lobby, userId: string, slotIndex: number) {
    const finalSlotIndex =
      slotIndex === -1 ? this.slots.firstFoundEmptySlot.index : slotIndex;
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    assert.ok(
      this.slots.at(finalSlotIndex).isEmpty,
      new LobbyAccessError("Желаемый слот занят"),
    );
    // ? add own emit ?
    return this.insertUser(lobby.removeUser(userId), finalSlotIndex);
  }

  deleteSelf(initiatorId: string) {
    assert.ok(this.admin.id === initiatorId, new LobbyAccessError());
    this.#lobbiesEmitter.emit("lobby##remove", { lobby: this });
  }
}

export class LobbyUserJoinEvent extends CustomWebsocketEvent {
  lobbyId;
  user;
  slotIndex;

  constructor(lobby, slot) {
    super("lobby::user::join");
    this.lobbyId = lobby.id;
    this.user = slot.user;
    this.slotIndex = slot.index;
  }
}

export class LobbyUserMoveEvent extends CustomWebsocketEvent {
  lobbyId;
  newSlotIndex;
  pastSlotIndex;

  constructor(lobby, newSlot, oldSlot) {
    super("lobby::user::move");
    this.lobbyId = lobby.id;
    this.newSlotIndex = newSlot.index;
    this.pastSlotIndex = oldSlot.index;
  }
}

export class LobbyAdminUpdateEvent extends CustomWebsocketEvent {
  lobbyId;
  newAdminId;

  constructor(lobby) {
    super("lobby::admin::update");
    this.lobbyId = lobby.id;
    this.newAdminId = lobby.admin.id;
  }
}
