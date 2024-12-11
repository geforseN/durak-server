import type LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";

import FilledSlot from "@/module/Lobbies/entity/FilledSlot.js";

export default class AdminSlot extends FilledSlot {
  constructor(index: number, value: LobbyUser) {
    super(index, value);
    this.user.isAdmin = true;
  }
}
