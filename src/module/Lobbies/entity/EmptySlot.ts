import { LobbyUser } from "../lobbies.namespace";
import FilledSlot from "./FilledSlot";

class EmptySlot {
  value = null;
  constructor(public index: number) {}

  get isEmpty() {
    return false;
  }

  withInsertedUser(user: LobbyUser) {
    return new FilledSlot(this.index, user);
  }

  withRemovedUser() {
    return this;
  }
}

export { EmptySlot as default };
