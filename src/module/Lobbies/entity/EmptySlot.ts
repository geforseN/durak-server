import AdminSlot from "@/module/Lobbies/entity/AdminSlot.js";
import FilledSlot from "@/module/Lobbies/entity/FilledSlot.js";
import LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

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
