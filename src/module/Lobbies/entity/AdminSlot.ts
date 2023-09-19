import type LobbyUser from "./LobbyUser.js";

import FilledSlot from "./FilledSlot.js";

export default class AdminSlot extends FilledSlot {
  constructor(index: number, value: LobbyUser) {
    super(index, value);
    this.user.isAdmin = true;
  }
}
