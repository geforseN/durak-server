import assert from "node:assert";
import crypto from "node:crypto";
import CorrectGameSettings, { type GameSettings } from "./CorrectGameSettings";
import type EventEmitter from "events";
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

  constructor({
    settings,
    lobbiesEmitter,
  }: {
    settings: GameSettings;
    lobbiesEmitter: EventEmitter;
  }) {
    this.lobbiesEmitter = lobbiesEmitter;
    this.id = crypto.randomUUID();
    this.settings = new CorrectGameSettings(settings);
    this.slots = new LobbySlots({
      size: settings.userCount,
      emitter: this.lobbiesEmitter,
    });
    this.lobbiesEmitter.emit("lobby##add", { lobby: this });
  }

  assertSlotIndex(slotIndex: number) {
    if (!Number.isInteger(slotIndex)) throw 1;
    if (slotIndex < -1) throw 2;
    if (slotIndex > this.settings.userCount) throw 3;
  }
  
  ensureIsAdmin(userId: string) {
    assert.ok(this.admin.id === userId, new LobbyAccessError());
  }
  
  ensureCanJoin(userId: string, slotIndex: number) {
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    // NOTE: fast return below but still should handle -1 later
    if (slotIndex === -1) return;
    const slotToJoin = this.slots.value[slotIndex];
    const userSlot = this.slots.ABSTRACT__findUser(userId);
    assert.ok(slotToJoin.isEmpty);
    if (!userSlot) return;
    assert.ok(userSlot.index !== slotToJoin, "Данный слот уже занят вами");
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

  hasUser(userId: string) {
    return this.slots.hasUser(userId);
  }

  get admin() {
    return this.slots.admin;
  }

  @emitUserInserted
  insertUser(user: LobbyUser, slotIndex: number): number {
    this.assertSlotIndex(slotIndex);
    return this.slots.putUser(user, slotIndex);
  }

  updateToUnstartedGame(): void {
    durakGames.set(this.id, new UnstartedGame(this));
    this.lobbiesEmitter.emit("lobby##remove", { lobbyId: this.id });
  }

  @emitUserRemovedAndMore
  removeUser(userId: string): LobbyUser {
    return this.slots.removeUser(userId);
  }

  @emitUserMoved
  moveUser(userId: string, newSlotIndex: number): number {
    if (this.isFull) throw new LobbyAccessError("Лобби полностью занято");
    const newSlot = this.slots.getSlotForInsert(newSlotIndex);
    const oldSlot = this.slots.getSlotOfUser(userId);
    this.slots.swapValues(oldSlot, newSlot);
    return oldSlot.index;
  }
}

function emitUserRemovedAndMore<
  This extends Lobby,
  Args extends Parameters<Lobby["removeUser"]>,
  Return extends ReturnType<Lobby["removeUser"]>,
>(
  target: (this: This, ...args: Args) => Return,
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
    return removedUser;
  };
}

function emitUserMoved<
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
    const pastSlotIndex = target.call(this, userId, newSlotIndex);
    this.lobbiesEmitter.emit("everySocket", "lobby::user::move", {
      lobbyId: this.id,
      userId,
      newSlotIndex,
      pastSlotIndex,
    });
    return pastSlotIndex as Return;
  };
}

function emitUserInserted<
  This extends Lobby,
  Args extends Parameters<Lobby["insertUser"]>,
  Return extends ReturnType<Lobby["insertUser"]>,
>(
  target: (this: This, ...args: Args) => Return,
  __context__: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args): Return {
    const [user] = args;
    const filledSlotIndex = target.apply(this, args);
    this.lobbiesEmitter.emit("everySocket", "lobby::user::put", {
      lobbyId: this.id,
      user,
      slotIndex: filledSlotIndex,
    });
    return filledSlotIndex;
  };
}
