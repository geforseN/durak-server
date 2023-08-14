import AdminSlot from "./AdminSlot";
import FilledSlot from "./FilledSlot";
import LobbyUser from "./LobbyUser";

class EmptySlot {
  value = null;
  constructor(public index: number) {}

  get isEmpty() {
    return true;
  }

  withInsertedUser(user: LobbyUser) {
    return new FilledSlot(this.index, user);
  }

  withInsertedAdminUser(user: LobbyUser) {
    return new AdminSlot(this.index, user);
  }

  withRemovedUser() {
    return this;
  }
}

export { EmptySlot as default };
