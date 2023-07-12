import assert from "node:assert";
import crypto from "node:crypto";
import type EventEmitter from "node:events";
import CorrectGameSettings, { type GameSettings } from "./CorrectGameSettings";
import LobbySlots from "./LobbySlots";
import { type LobbyUser } from "../lobbies.namespace";
import { LobbyAccessError } from "../error";
import { durakGames } from "../../..";
import { UnstartedGame } from "../../DurakGame/NonstartedDurakGame";

export default class Lobby {
  id: string;
  settings: GameSettings;
  slots: LobbySlots;
  lobbiesEmitter: EventEmitter;

  constructor(settings: GameSettings, lobbiesEmitter: EventEmitter) {
    this.settings = new CorrectGameSettings(settings);
    this.lobbiesEmitter = lobbiesEmitter;
    this.id = crypto.randomUUID();
    this.slots = new LobbySlots(settings.userCount, this.lobbiesEmitter);
    this.lobbiesEmitter.emit("lobby##add", { lobby: this });
    // TODO: this.emptySlots = new EmptySlotsOfLobby(this)
    // TODO: this.users = new UsersOfLobby(this)
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

  get admin() {
    return this.slots.admin;
  }

  hasUser(userId: string) {
    return this.slots.hasUser(userId);
  }

  @insertSlotIndexAndEmitUserInserted
  insertUser(user: LobbyUser, slotIndex: number): number {
    return this.slots.insertUser(user, slotIndex);
  }

  @emitLobbyRemoved
  updateToUnstartedGame(userIdOfWhoWannaUpdate: string): void {
    assert.ok(this.admin.id === userIdOfWhoWannaUpdate, new LobbyAccessError());
    durakGames.set(this.id, new UnstartedGame(this));
  }

  @emitUserRemovedAndMore
  removeUser(userId: string): LobbyUser {
    return this.slots.removeUser(userId);
  }

  @assertSlotIndexAndEmitUserMoved
  moveUser(userId: string, newSlotIndex: number): number {
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    const [newSlot, oldSlot] = [
      this.slots.getEmptySlot(newSlotIndex),
      this.slots.getSlotOfUser(userId),
    ];
    this.slots.swapValues(oldSlot, newSlot);
    return oldSlot.index;
  }

  // TODO add emit decorator
  pickUserFrom(lobby: Lobby, userId: string, slotIndex: number) {
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    assert.ok(
      this.slots.at(slotIndex).isEmpty,
      new LobbyAccessError("Желаемый слот занят"),
    );
    return this.insertUser(lobby.removeUser(userId), slotIndex);
  }

  @emitLobbyRemoved
  deleteSelf(userIdOfWhoWannaRemove: string) {
    assert.ok(this.admin.id === userIdOfWhoWannaRemove, new LobbyAccessError());
  }
}

function emitUserRemovedAndMore<
  This extends Lobby,
  Args extends Parameters<Lobby["removeUser"]>,
  Return extends ReturnType<Lobby["removeUser"]>,
>(
  target: Lobby["removeUser"],
  __context__: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args): Return {
    const removedUser = target.apply(this, args);
    this.lobbiesEmitter.emit("lobby::user::remove", {
      lobbyId: this.id,
      userId: removedUser.id,
    });
    if (this.isEmpty) {
      this.lobbiesEmitter.emit("lobby##remove", {
        lobbyId: this.id,
      });
    } else if (removedUser.isAdmin) {
      this.slots.admin = this.slots.mostLeftSideNonAdminUser;
      this.lobbiesEmitter.emit("everySocket", "lobby::admin::update", {
        adminId: this.slots.admin.id,
        lobbyId: this.id,
      });
    }
    return removedUser as Return;
  };
}

function assertSlotIndexAndEmitUserMoved<
  This extends Lobby,
  Args extends Parameters<Lobby["moveUser"]>,
  Return extends ReturnType<Lobby["moveUser"]>,
>(
  target: This["moveUser"],
  __context__: ClassMethodDecoratorContext<Lobby, Lobby["moveUser"]>,
) {
  return function (this: Lobby, ...args: Args): Return {
    const [userId, newSlotIndex] = args;
    assert.ok(newSlotIndex !== -1, "Вас следует указать определённый индекс");
    assert.ok(
      Number.isInteger(newSlotIndex) &&
        newSlotIndex >= 0 &&
        newSlotIndex < this.settings.userCount,
    );
    const pastSlotIndex = target.apply(this, [userId, newSlotIndex]);
    this.lobbiesEmitter.emit("everySocket", "lobby::user::move", {
      lobbyId: this.id,
      userId,
      newSlotIndex,
      pastSlotIndex,
    });
    return pastSlotIndex as Return;
  };
}

function insertSlotIndexAndEmitUserInserted<
  This extends Lobby,
  Args extends Parameters<Lobby["insertUser"]>,
  Return extends ReturnType<Lobby["insertUser"]>,
>(
  target: Lobby["insertUser"],
  __context__: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args): Return {
    let [user, slotIndex] = args;
    if (slotIndex === -1) {
      slotIndex = this.slots.firstFoundEmptySlot.index;
    }
    const filledSlotIndex = target.apply(this, [user, slotIndex]);
    this.lobbiesEmitter.emit("everySocket", "lobby::user::insert", {
      lobbyId: this.id,
      user,
      slotIndex: filledSlotIndex,
    });
    return filledSlotIndex as Return;
  };
}

function emitLobbyRemoved<This extends Lobby, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  __context__: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args) {
    target.apply(this, args);
    this.lobbiesEmitter.emit("lobby##remove", { lobbyId: this.id });
  };
}
