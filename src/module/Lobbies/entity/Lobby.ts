import assert from "node:assert";
import crypto from "node:crypto";
import type { GameSettings } from "@durak-game/durak-dts";
import type EventEmitter from "node:events";
import type { InitialGameSettings, CardDTO } from "@durak-game/durak-dts";

import { CustomWebsocketEvent } from "../../../ws/index.js";

import { LobbyAccessError } from "../error.js";
import CorrectGameSettings from "./CorrectGameSettings.js";
import LobbySlots from "./LobbySlots.js";
import type EmptySlot from "./EmptySlot.js";
import type FilledSlot from "./FilledSlot.js";
import type LobbyUser from "./LobbyUser.js";


export default class Lobby {
  #lobbiesEmitter: EventEmitter;
  id: string;
  settings: GameSettings;
  slots: LobbySlots;

  constructor(
    settings: InitialGameSettings & { trumpCard?: CardDTO },
    lobbiesEmitter: EventEmitter,
  ) {
    this.settings = new CorrectGameSettings(settings);
    this.#lobbiesEmitter = lobbiesEmitter;
    this.id = crypto.randomUUID();
    this.slots = new LobbySlots(this.settings.players.count);
    this.#lobbiesEmitter.emit("lobby##add", { lobby: this });
    // TODO: this.emptySlots = new EmptySlots(this)
    // TODO: this.userSlots = new UsersSlots(this)
  }

  deleteSelf(initiatorId: string) {
    assert.ok(this.admin.id === initiatorId, new LobbyAccessError());
    this.#lobbiesEmitter.emit("lobby##remove", { lobby: this });
  }

  hasUser(userId: string) {
    return this.slots.hasUser(userId);
  }

  insertUser(user: LobbyUser, slotIndex: number) {
    const finalSlotIndex =
      slotIndex === -1 ? this.slots.firstFoundEmptySlot.index : slotIndex;
    const filledSlot = this.slots.insertUser(user, finalSlotIndex);
    this.#lobbiesEmitter.emit("lobby##user##join", {
      lobby: this,
      slot: filledSlot,
    });
  }

  moveUser(userId: string, newSlotIndex: number) {
    assert.ok(
      newSlotIndex !== -1,
      new RangeError("Вас следует указать определённый индекс"),
    );
    assert.ok(
      Number.isInteger(newSlotIndex) &&
        newSlotIndex >= 0 &&
        newSlotIndex < this.settings.players.count,
      new RangeError("Неверный индекс"),
    );
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    const [newSlot, oldSlot] = this.slots.moveUser(
      this.slots.getSlotOfUser(userId),
      this.slots.getEmptySlotAt(newSlotIndex),
    );
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
      this.slots.at(finalSlotIndex).isEmpty(),
      new LobbyAccessError("Желаемый слот занят"),
    );
    // NOTE - ? add own emit ?
    return this.insertUser(lobby.removeUser(userId), finalSlotIndex);
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

  toJSON() {
    return { ...this };
  }

  upgradeToNonStartedGame(initiator: LobbyUser): void {
    assert.ok(this.admin.id === initiator.id, new LobbyAccessError());
    assert.ok(this.isFull, "Каждый слот должен быть заполнен игроком");
    this.#lobbiesEmitter.emit("lobby##upgrade", { lobby: this });
  }

  get admin() {
    return this.slots.admin;
  }

  get isEmpty() {
    return this.slots.isEmpty;
  }

  get isFull() {
    return this.slots.isFull;
  }

  get userSlots() {
    return this.slots.userSlots;
  }
}

export class LobbyUserJoinEvent extends CustomWebsocketEvent {
  lobbyId;
  slotIndex;
  user;

  constructor(lobby: Lobby, slot: FilledSlot) {
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

  constructor(lobby: Lobby, newSlot: FilledSlot, oldSlot: EmptySlot) {
    super("lobby::user::move");
    this.lobbyId = lobby.id;
    this.newSlotIndex = newSlot.index;
    this.pastSlotIndex = oldSlot.index;
  }
}

export class LobbyAdminUpdateEvent extends CustomWebsocketEvent {
  lobbyId;
  newAdminId;

  constructor(lobby: Lobby) {
    super("lobby::admin::update");
    this.lobbyId = lobby.id;
    this.newAdminId = lobby.admin.id;
  }
}
