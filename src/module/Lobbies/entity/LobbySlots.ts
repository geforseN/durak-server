import assert from "node:assert";
import EventEmitter from "events";

export default class LobbySlots<
  LobbyUser extends { id: string; isAdmin: boolean },
> {
  readonly #value: (LobbyUser | undefined)[];
  emitter: EventEmitter;

  constructor({ size, emitter }: { size: number; emitter: EventEmitter }) {
    this.#value = new Array(size).fill(undefined);
    this.emitter = emitter;
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
    return this.#findUser((user) => user?.isAdmin === true, "Админ не найден");
  }

  set admin(newAdminId: string) {
    this.admin.isAdmin = false;
    const user = this.#findUser((user) => user?.id === newAdminId);
    user.isAdmin = true;
    this.emitter.emit("admin::update", user);
  }

  get mostLeftSideNonAdminUser() {
    return this.#findUser(
      (user) => user?.id !== this.admin.id,
      "Не получилось обновить админа лобби: некому стать новым админом",
    );
  }

  hasUser(cb: (user?: LobbyUser) => boolean) {
    return this.#value.some(cb);
  }

  putUser(user: LobbyUser, slotIndex = -1): number {
    if (slotIndex === -1) {
      return this.#putUserInFirstFoundEmptySlot(user);
    }
    assert.ok(
      this.#slotAt(slotIndex).IsValid,
      "Неверно указан желаемый индекс слота",
    );
    this.#putUser(user, slotIndex);
    return slotIndex;
  }

  moveUser(cb: (user?: LobbyUser) => boolean, slotIndex: number) {
    return this.#putUser(this.removeUser(cb), slotIndex);
  }

  removeUser(cb: (user?: LobbyUser) => boolean) {
    return this.#removeUserByIndex(this.value.indexOf(this.#findUser(cb)));
  }

  #putUserInFirstFoundEmptySlot(user: LobbyUser): number {
    const slotIndex = this.#firstFoundEmptySlotIndex;
    this.#putUser(user, slotIndex);
    return slotIndex;
  }

  get #firstFoundEmptySlotIndex() {
    return this.#value.indexOf(this.#value.find((slot) => !slot));
  }

  #putUser(user: LobbyUser, slotIndex: number): LobbyUser {
    assert.ok(
      this.#slotAt(slotIndex).isEmpty,
      "Данный слот уже занят другим игроком.",
    );
    this.#value.splice(slotIndex, 1, user);
    // this.emitter.emit("user::join", user, slotIndex);
    return user;
  }

  #findUser(
    cb: (user?: LobbyUser) => boolean,
    notFoundMessage: string | Error = "Пользователь не был найден",
  ): LobbyUser {
    const user = this.#users.find(cb);
    assert.ok(user, notFoundMessage);
    return user;
  }

  #removeUserByIndex(slotIndex: number): LobbyUser {
    const [user] = this.#value.splice(slotIndex, 1, undefined);
    assert.ok(user, "NO WAY: По желаемому индексу не был удален игрок");
    this.emitter.emit("user::leave", user, slotIndex);
    return user;
  }

  #slotAt(slotIndex: number) {
    return {
      isEmpty: this.#value[slotIndex] === undefined,
      IsValid:
        Number.isInteger(slotIndex) &&
        slotIndex >= 0 &&
        slotIndex <= this.slotsCount - 1,
    };
  }
}
