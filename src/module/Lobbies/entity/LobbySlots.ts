import assert from "node:assert";
import EmptySlot from "./EmptySlot.js";
import FilledSlot from "./FilledSlot.js";
import { raise } from "../../../index.js";
import { InternalError } from "../../DurakGame/error/index.js";
import LobbyUser from "./LobbyUser.js";

export default class LobbySlots {
  readonly #value: (EmptySlot | FilledSlot)[];
  #lobbyId = undefined;

  constructor(slotsCount: number) {
    this.#value = Array.from(
      { length: slotsCount },
      (_, index) => new EmptySlot(index),
    );
  }

  get value() {
    return this.#value.map((slot) => slot.value);
  }

  toJSON() {
    return this.#value.map((slot) => slot.value);
  }

  get userSlots() {
    return this.#value.filter((slot): slot is FilledSlot => slot.isFilled());
  }

  get #emptySlots() {
    return this.#value.filter((slot): slot is EmptySlot => slot.isEmpty());
  }

  get usersCount() {
    return this.userSlots.length;
  }

  get isEmpty() {
    return this.usersCount === 0;
  }

  get isFull() {
    return this.usersCount === this.slotsCount;
  }

  get slotsCount(): number {
    return this.#value.length;
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

  hasUser(userId: string): boolean {
    return this.userSlots.some((slot) => slot.user.id === userId);
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

  insertUser(user: LobbyUser, slotIndex: number): FilledSlot {
    this.#value[slotIndex] = this.isEmpty
      ? this.at(slotIndex).withInsertedAdminUser(user)
      : this.at(slotIndex).withInsertedUser(user);
    const slot = this.#value[slotIndex];
    assert.ok(slot.isFilled(), "TypeScript");
    return slot;
  }

  removeUser(userId: string): LobbyUser {
    const { index, user } = this.getSlotOfUser(userId);
    this.#value[index] = this.at(index).withRemovedUser();
    return user;
  }

  get firstFoundEmptySlot(): EmptySlot | never {
    return (
      this.#value.find((slot): slot is EmptySlot => slot.isEmpty()) || raise()
    );
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
}
