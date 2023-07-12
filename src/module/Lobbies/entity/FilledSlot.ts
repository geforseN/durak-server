import { LobbyUser } from "../lobbies.namespace";
import EmptySlot from "./EmptySlot";
class FilledSlot {
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

  withRemovedUser() {
    return new EmptySlot(this.index);
  }
}

export { FilledSlot as default };
