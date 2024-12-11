import type LobbyUser from "@/module/Lobbies/entity/LobbyUser.js";
import GamePlayerWebsocketService from "@/module/DurakGame/entity/Player/Player.service.js";
import { Hand } from "@/module/DurakGame/entity/Deck/index.js";

export class NonStartedGameUser {
  info: LobbyUser;
  index: number;
  lobbySlotsCount: number;
  wsService: GamePlayerWebsocketService;
  hand: Hand;

  constructor({
    info,
    index,
    lobbySlotsCount,
    wsService,
    hand,
  }: {
    info: LobbyUser;
    index: number;
    lobbySlotsCount: number;
    wsService: GamePlayerWebsocketService;
    hand: Hand;
  }) {
    this.info = info;
    this.index = index;
    this.lobbySlotsCount = lobbySlotsCount;
    this.hand = hand;
    this.wsService = wsService;
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
