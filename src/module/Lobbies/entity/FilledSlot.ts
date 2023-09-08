import AdminSlot from "./AdminSlot.js";
import EmptySlot from "./EmptySlot.js";
import LobbyUser from "./LobbyUser.js";

export class FilledSlot {
  constructor(public index: number, public value: LobbyUser) {}

  isEmpty(): this is EmptySlot {
    return false;
  }

  isFilled(): this is FilledSlot {
    return true;
  }

  get user() {
    return this.value;
  }

  withInsertedUser(user: LobbyUser) {
    return new FilledSlot(this.index, user);
  }

  withInsertedAdminUser() {
    return new AdminSlot(this.index, this.value);
  }

  withRemovedUser() {
    return new EmptySlot(this.index);
  }

  toJSON() {
    return { ...this.user };
  }
}

export { FilledSlot as default };
