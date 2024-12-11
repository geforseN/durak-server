import AdminSlot from "@/module/Lobbies/entity/AdminSlot.js";
import EmptySlot from "@/module/Lobbies/entity/EmptySlot.js";
import LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

export default class FilledSlot {
  constructor(public index: number, public value: LobbyUser) {}

  isEmpty(): this is EmptySlot {
    return false;
  }

  isFilled(): this is FilledSlot {
    return true;
  }

  toJSON() {
    return { ...this.user };
  }

  withInsertedAdminUser() {
    return new AdminSlot(this.index, this.value);
  }

  withInsertedUser(user: LobbyUser) {
    return new FilledSlot(this.index, user);
  }

  withRemovedUser() {
    return new EmptySlot(this.index);
  }

  get user() {
    return this.value;
  }
}

