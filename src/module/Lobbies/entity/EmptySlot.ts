import AdminSlot from "./AdminSlot";
import FilledSlot from "./FilledSlot";
import LobbyUser from "./LobbyUser";

class EmptySlot {
  value = null;
  constructor(public index: number) {}

  isEmpty(): this is EmptySlot {
    return true;
  }

  isFilled(): this is FilledSlot {
    return false;
  }

  withInsertedUser(user: LobbyUser) {
    return new FilledSlot(this.index, user);
  }

  withInsertedAdminUser(user: LobbyUser) {
    return new AdminSlot(this.index, user);
  }

  withRemovedUser() {
    return new EmptySlot(this.index);
  }

  toJSON() {
    return null;
  }
}

export { EmptySlot as default };
