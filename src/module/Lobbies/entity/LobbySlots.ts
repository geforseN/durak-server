import assert from "node:assert";

import raise from "@/common/raise.js";
import { InternalError } from "@/module/DurakGame/error/index.js";
import EmptySlot from "@/module/Lobbies/entity/EmptySlot.js";
import FilledSlot from "@/module/Lobbies/entity/FilledSlot.js";
import LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

export default class LobbySlots {
  #lobbyId = undefined;
  readonly #value: (EmptySlot | FilledSlot)[];

  constructor(slotsCount: number) {
    this.#value = Array.from(
      { length: slotsCount },
      (_, index) => new EmptySlot(index),
    );
  }

  get #emptySlots() {
    return this.#value.filter((slot): slot is EmptySlot => slot.isEmpty());
  }

  at(slotIndex: number) {
    assert.ok(
      Number.isInteger(slotIndex) &&
        slotIndex >= 0 &&
        slotIndex < this.#value.length,
    );
    return this.#value[slotIndex];
  }

  getEmptySlotAt(slotIndex: number) {
    return (
      this.#emptySlots.find((slot) => slot.index === slotIndex) ||
      raise(new Error("Данный слот уже занят"))
    );
  }

  getSlotOfUser(userId: string): FilledSlot | never {
    return (
      this.userSlots.find((userSlot) => userSlot.user.id === userId) ||
      raise(new Error("Пользователь с переданным userId не был найден"))
    );
  }

  hasUser(userId: string): boolean {
    return this.userSlots.some((slot) => slot.user.id === userId);
  }

  insertUser(user: LobbyUser, slotIndex: number): FilledSlot {
    this.#value[slotIndex] = this.isEmpty
      ? this.at(slotIndex).withInsertedAdminUser(user)
      : this.at(slotIndex).withInsertedUser(user);
    const slot = this.#value[slotIndex];
    assert.ok(slot.isFilled(), "TypeScript");
    return slot;
  }

  moveUser(oldSlot: FilledSlot, newSlot: EmptySlot): [FilledSlot, EmptySlot] {
    this.#value[newSlot.index] = new FilledSlot(newSlot.index, oldSlot.value);
    this.#value[oldSlot.index] = new EmptySlot(oldSlot.index);
    const filledSlot = this.#value[newSlot.index];
    assert.ok(filledSlot.isFilled(), "TypeScript");
    const emptySlot = this.#value[oldSlot.index];
    assert.ok(emptySlot.isEmpty(), "TypeScript");
    return [filledSlot, emptySlot];
  }

  removeUser(userId: string): LobbyUser {
    const { index, user } = this.getSlotOfUser(userId);
    this.#value[index] = this.at(index).withRemovedUser();
    return user;
  }

  toJSON() {
    return this.#value.map((slot) => slot.value);
  }

  get admin(): LobbyUser | never {
    return (
      this.userSlots.find((slot) => slot.user.isAdmin)?.user ||
      raise(new InternalError())
    );
  }

  set admin(newAdmin: LobbyUser) {
    this.admin.isAdmin = false;
    newAdmin.isAdmin = true;
  }

  get firstFoundEmptySlot(): EmptySlot | never {
    return (
      this.#value.find((slot): slot is EmptySlot => slot.isEmpty()) || raise()
    );
  }

  get isEmpty() {
    return this.usersCount === 0;
  }

  get isFull() {
    return this.usersCount === this.slotsCount;
  }

  get mostLeftSideNonAdminUser() {
    return (
      this.userSlots.find((slot) => !slot.user.isAdmin)?.user ||
      raise(
        new InternalError(
          "Не получилось обновить админа лобби: некому стать новым админом",
        ),
      )
    );
  }

  get slotsCount(): number {
    return this.#value.length;
  }

  get userSlots() {
    return this.#value.filter((slot): slot is FilledSlot => slot.isFilled());
  }

  get usersCount() {
    return this.userSlots.length;
  }

  get value() {
    return this.#value.map((slot) => slot.value);
  }
}
