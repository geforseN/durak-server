import type LobbyUser from "../../../Lobbies/entity/LobbyUser.js";

export class NonStartedGameUser {
  info: LobbyUser;
  index: number;
  lobbySlotsCount: number;

  constructor({
    info,
    index,
    lobbySlotsCount,
  }: {
    info: LobbyUser;
    index: number;
    lobbySlotsCount: number;
  }) {
    this.info = info;
    this.index = index;
    this.lobbySlotsCount = lobbySlotsCount;
  }

  get #isFirstPlayer() {
    return this.index === 0;
  }

  get #isLastPlayer() {
    return this.index === this.lobbySlotsCount - 1;
  }

  get leftPlayerIndex() {
    return this.#isLastPlayer ? 0 : this.index + 1;
  }

  get rightPlayerIndex() {
    return this.#isFirstPlayer ? this.lobbySlotsCount - 1 : this.index - 1;
  }
}

export default NonStartedGameUser;
