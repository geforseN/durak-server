import assert from "node:assert";
import EventEmitter from "events";
import { LobbyAccessError } from "../error";

export default class LobbySlots<
  LobbyUser extends { id: string; isAdmin: boolean },
> {
  readonly #value: (LobbyUser | undefined)[];
  readonly #emitter: EventEmitter;

  constructor({ size, emitter }: { size: number; emitter: EventEmitter }) {
    this.#value = new Array(size).fill(undefined);
    this.#emitter = emitter;
  }

  get value() {
    return [...this.#value];
  }

  get #users() {
    return this.#value.filter((user) => user) as LobbyUser[];
  }

  get users() {
    return [...this.#users];
  }

  get usersCount() {
    return this.users.length;
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

  get admin(): LobbyUser {
    return this.getUser((user) => user.isAdmin, "Админ не найден");
  }

  swap(i: number, k: number) {
    [this.#value[i], this.#value[k]] = [this.#value[k], this.#value[i]];
  }

  set admin(newAdmin: LobbyUser) {
    this.admin.isAdmin = false;
    const user = this.getUser((user) => user.id === newAdmin.id);
    user.isAdmin = true;
    this.#emitter.emit("admin::update", user);
  }

  get mostLeftSideNonAdminUser() {
    return this.getUser(
      (user) => user.id !== this.admin.id,
      "Не получилось обновить админа лобби: некому стать новым админом",
    );
  }

  has(cb: (user?: LobbyUser) => boolean) {
    return this.#value.some(cb);
  }

  putUser(user: LobbyUser, slotIndex = -1): number {
    assert.ok(!this.isFull, new LobbyAccessError("Лобби полностью занято"));
    slotIndex = slotIndex === -1 ? this.#firstFoundEmptySlotIndex : slotIndex;
    assert.ok(
      this.slotAt(slotIndex).isValid,
      "Неверно указан желаемый индекс слота",
    );
    assert.ok(
      this.slotAt(slotIndex).isEmpty,
      new LobbyAccessError("Cлот уже занят"),
    );
    this.#value.splice(slotIndex, 1, user);
    return slotIndex;
  }

  move(cb: (user?: LobbyUser) => boolean, slotIndex: number) {
    return this.#putUser(this.remove(cb), slotIndex);
  }

  remove(cb: (user?: LobbyUser) => boolean) {
    const userIndex = this.value.indexOf(this.getUser(cb));
    return this.#removeUserByIndex(userIndex);
  }

  get #firstFoundEmptySlotIndex() {
    return this.#value.indexOf(this.#value.find((slot) => !slot));
  }

  #putUser(user: LobbyUser, slotIndex: number): LobbyUser {
    assert.ok(
      this.slotAt(slotIndex).isEmpty,
      "Данный слот уже занят другим игроком.",
    );
    this.#value.splice(slotIndex, 1, user);
    // this.emitter.emit("user::join", user, slotIndex);
    return user;
  }

  getUser(
    cb: (user: LobbyUser) => boolean,
    notFoundMessage: string | Error = "Пользователь не был найден",
  ): LobbyUser {
    const user = this.#users.find(cb);
    assert.ok(user, notFoundMessage);
    return user;
  }

  findSlotIndex(cb: (user?: LobbyUser) => boolean) {
    return this.#value.findIndex(cb);
  }

  #removeUserByIndex(slotIndex: number): LobbyUser {
    const [user] = this.#value.splice(slotIndex, 1, undefined);
    assert.ok(user, "NO WAY: По желаемому индексу не был удален игрок");
    this.#emitter.emit("user::leave", user, slotIndex);
    return user;
  }

  slotAt(slotIndex: number) {
    return {
      isEmpty: !!this.#value[slotIndex],
      isValid:
        Number.isInteger(slotIndex) &&
        slotIndex >= 0 &&
        slotIndex <= this.slotsCount - 1,
    };
  }
}
