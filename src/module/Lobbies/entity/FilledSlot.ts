import { LobbyUser } from "../lobbies.namespace";

export default class FilledSlot {
  isFilled = false;
  isEmpty = true;
  index: number;
  value: LobbyUser;

  constructor(index: number, value: LobbyUser) {
    this.index = index;
    this.value = value;
  }

  get user() {
    return this.value;
  }
}
