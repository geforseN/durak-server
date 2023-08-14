import LobbyUser from "./LobbyUser";
import { FilledSlot } from "./FilledSlot";

class AdminSlot extends FilledSlot {
  constructor(index: number, value: LobbyUser) {
    super(index, value);
    this.user.isAdmin = true;
  }
}

export { AdminSlot as default };
