import AdminSlot from "./AdminSlot.js";
import FilledSlot from "./FilledSlot.js";
import LobbyUser from "./LobbyUser.js";

class EmptySlot {
  value = null;
  constructor(public index: number) {}

  isEmpty(): this is EmptySlot {
    return true;
  }

  isFilled(): this is FilledSlot {
    return false;
  }

  toJSON() {
    return null;
  }

  withInsertedAdminUser(user: LobbyUser) {
    return new AdminSlot(this.index, user);
  }

  withInsertedUser(user: LobbyUser) {
    return new FilledSlot(this.index, user);
  }

  withRemovedUser() {
    return new EmptySlot(this.index);
  }
}

export { EmptySlot as default };
