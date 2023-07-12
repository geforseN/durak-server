import assert from "node:assert";
import EventEmitter from "events";
import EmptySlot from "./EmptySlot";
import FilledSlot from "./FilledSlot";
import { raise } from "../../..";
import { LobbyUser } from "../lobbies.namespace";

export default class LobbySlots {
  readonly #value: (EmptySlot | FilledSlot)[];

  constructor(slotsCount: number, __emitter__: EventEmitter) {
    this.#value = Array.from(
      { length: slotsCount },
      (_, index) => new EmptySlot(index),
    );
  }

  get value() {
    return this.#value.map((slot) => slot.value);
  }

  get #userSlots() {
    return this.#value.filter(
      (slot): slot is FilledSlot => slot instanceof FilledSlot,
    );
  }

  get #emptySlots() {
    return this.#value.filter(
      (slot): slot is EmptySlot => slot instanceof EmptySlot,
    );
  }

  get usersCount() {
    return this.#userSlots.length;
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
    return this.#userSlots.find((slot) => slot.user.isAdmin)?.user || raise();
  }

  set admin(newAdmin: LobbyUser) {
    this.admin.isAdmin = false;
    newAdmin.isAdmin = true;
  }

  get mostLeftSideNonAdminUser() {
    const { admin } = this;
    return (
      this.#userSlots.find((slot) => slot.user !== admin)?.user ||
      raise(
        new Error(
          "Не получилось обновить админа лобби: некому стать новым админом",
        ),
      )
    );
  }

  hasUser(userid: string): boolean {
    return this.#userSlots.some((slot) => slot.user.id === userid);
  }

  swapValues(oldSlot: FilledSlot, newSlot: EmptySlot) {
    this.#value[newSlot.index] = new FilledSlot(newSlot.index, oldSlot.value);
    this.#value[oldSlot.index] = new EmptySlot(oldSlot.index);
  }

  insertUser(user: LobbyUser, slotIndex: number): number | never {
    this.#value[slotIndex] = this.at(slotIndex).withInsertedUser(user);
    return slotIndex;
  }

  removeUser(userId: string): LobbyUser {
    const { index, user } = this.getSlotOfUser(userId);
    this.#value[index] = this.at(index).withRemovedUser();
    return user;
  }

  get firstFoundEmptySlot(): EmptySlot | never {
    return (
      this.#value.find(
        (slot): slot is EmptySlot => slot instanceof EmptySlot,
      ) || raise()
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

  getEmptySlot(slotIndex: number) {
    return (
      this.#emptySlots.find((slot) => slot.index === slotIndex) ||
      raise(new Error("Данный слот уже занят"))
    );
  }

  getSlotOfUser(userId: string): FilledSlot | never {
    return (
      this.#userSlots.find((userSlot) => userSlot.user.id === userId) ||
      raise(/* ERROR */)
    );
  }
}
