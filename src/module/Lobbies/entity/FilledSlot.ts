import AdminSlot from "./AdminSlot";
import EmptySlot from "./EmptySlot";
import LobbyUser from "./LobbyUser";

export class FilledSlot {
  constructor(public index: number, public value: LobbyUser) {}

  get isEmpty() {
    return false;
  }

  get user() {
    return this.value;
  }

  withInsertedUser(user: LobbyUser) {
    this.value = user;
    return this;
  }

  withInsertedAdminUser() {
    return new AdminSlot(this.index, this.value);
  }

  withRemovedUser() {
    return new EmptySlot(this.index);
  }
}

export { FilledSlot as default };
