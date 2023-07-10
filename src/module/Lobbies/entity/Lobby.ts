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

  @insertUserwithEmit
  insertUser(user: LobbyUser, slotIndex: number) {
    return this.slots.putUser(user, slotIndex);
  }

  updateToUnstartedGame() {
    durakGames.set(this.id, new UnstartedGame(this));
    this.lobbiesEmitter.emit("lobby##remove", { lobbyId: this.id });
  }

  @removeUserWithEmits
  removeUser(userId: string) {
    return this.slots.removeUser(userId);
  }

  @moveUserWithEmit
  moveUser(userId: string, desiredSlotIndex: number) {
    const userSlotIndex = this.slots.getSlotIndexOfUser(userId);
    assert.ok(userSlotIndex !== desiredSlotIndex, "Данный слот уже занят вами");
    this.slots.swap(userSlotIndex, desiredSlotIndex);
    return userSlotIndex;
  }
}

function removeUserWithEmits<
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
    if (this.isEmpty) {
      /* TODO in lobbies remove this lobby from #map */
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

function moveUserWithEmit<
  This extends Lobby,
  Args extends Parameters<Lobby["moveUser"]>,
  Return extends ReturnType<Lobby["moveUser"]>,
>(
  target: (this: This, ...args: Args) => Return,
  __context__: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args): Return {
    const [userId, newSlotIndex] = args;
    const pastSlotIndex = target.apply(this, args);
    this.lobbiesEmitter.emit("everySocket", "lobby::user::move", {
      lobbyId: this.id,
      userId,
      newSlotIndex,
      // NOTE: property below can be omited
      pastSlotIndex,
    });
    return pastSlotIndex;
  };
}

function insertUserwithEmit<
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
