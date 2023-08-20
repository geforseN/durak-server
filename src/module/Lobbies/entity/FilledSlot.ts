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
    return new FilledSlot(this.index, user);
  }

  withInsertedAdminUser() {
    return new AdminSlot(this.index, this.value);
  }

  withRemovedUser() {
    return new EmptySlot(this.index);
  }

  toJSON() {
    return JSON.stringify(this.user);
  }
}

export { FilledSlot as default };
