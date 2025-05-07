import type LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";
import { Hand } from "@/module/DurakGame/entity/Deck/index.js";

export class NonStartedGameUser {
  info: LobbyUser;
  index: number;
  lobbySlotsCount: number;
  hand: Hand;

  constructor({
    info,
    index,
    lobbySlotsCount,
    hand,
  }: {
    info: LobbyUser;
    index: number;
    lobbySlotsCount: number;
    hand: Hand;
  }) {
    this.info = info;
    this.index = index;
    this.lobbySlotsCount = lobbySlotsCount;
    this.hand = hand;
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
