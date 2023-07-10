import assert from "node:assert";
import EventEmitter from "events";
import FilledSlot from "./FilledSlot";
import EmptySlot from "./EmptySlot";
import { raise } from "../../..";
import { LobbyUser } from "../lobbies.namespace";

export default class LobbySlots {
  readonly #value: (EmptySlot | FilledSlot)[];
  readonly #emitter: EventEmitter;

  constructor({
    size: length,
    emitter,
  }: {
    size: number;
    emitter: EventEmitter;
  }) {
    this.#value = Array.from({ length }, (_, index) => new EmptySlot(index));
    this.#emitter = emitter;
  }

  get value() {
    return this.#value.map((slot) => slot.value);
  }

  get #userSlots() {
    return this.#value.filter((slot): slot is FilledSlot => slot.isFilled);
  }

  get #emptySlots() {
    return this.#value.filter((slot): slot is FilledSlot => slot.isEmpty);
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
    return this.#userSlots.find((slot) => slot.user.isAdmin)?.value || raise();
  }

  hasUser(userid: string): boolean {
    return this.#userSlots.some((slot) => slot.user.id === userid);
  }

  swap(i: number, k: number) {
    [this.#value[i], this.#value[k]] = [this.#value[k], this.#value[i]];
  }

  set admin(newAdmin: LobbyUser) {
    this.admin.isAdmin = false;
    const user =
      this.#userSlots.find((slot) => slot.user.id === newAdmin.id)?.value ||
      raise();
    user.isAdmin = true;
    this.#emitter.emit("admin::update", user);
  }

  get mostLeftSideNonAdminUser() {
    // NOTE: comparing objects here, be careful, might work wrong
    return this.#userSlots.find(
      (slot) => slot.user !== this.admin,
      "Не получилось обновить админа лобби: некому стать новым админом",
    )?.user || raise();
  }

  putUser(user: LobbyUser, slotIndex = -1): number | never {
    throw new Error("Method not implemented.");
    slotIndex = slotIndex === -1 ? this.#firstFoundEmptySlotIndex : slotIndex;
    assert.ok(
      slotIndex !== -1,
      "Невероятная ошибка! Лобби не должно быть полностью занято, одна не был найден даже один свободный слот",
    );
    this.#value[slotIndex].ABSCTRACT__append(user);
    return slotIndex;
  }
  
  removeUser(userId: string): LobbyUser {
    // TODO EMIT 
    throw new Error("Method not implemented.");
  }

  get #firstFoundEmptySlotIndex(): number | never {
    return this.#emptySlots[0]?.index || raise();
  }

  getSlotIndexOfUser(userId: string): number | never {
    return (
      this.#userSlots.find((userSlot) => userSlot.user.id === userId)?.index ||
      raise()
    );
  }
}
