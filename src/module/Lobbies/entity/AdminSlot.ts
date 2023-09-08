import LobbyUser from "./LobbyUser.js";
import { FilledSlot } from "./FilledSlot.js";

class AdminSlot extends FilledSlot {
  constructor(index: number, value: LobbyUser) {
    super(index, value);
    this.user.isAdmin = true;
  }
}

export { AdminSlot as default };
