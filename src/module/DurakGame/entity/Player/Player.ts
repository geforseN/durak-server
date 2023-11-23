import type NonStartedGameUser from "./NonStartedGameUser.js";

import { BasePlayer } from "./BasePlayer.abstract.js";

export class Player extends BasePlayer {
  constructor(basePlayer: BasePlayer) {
    super(basePlayer);
  }

  static create(user: NonStartedGameUser): [number, Player, number] {
    return [
      user.leftPlayerIndex,
      new Player({
        hand: user.hand,
        info: user.info,
        // @ts-expect-error hard to type for now
        left: undefined,
        // @ts-expect-error hard to type for now
        right: undefined,
        wsService: user.wsService,
      }),
      user.rightPlayerIndex,
    ];
  }

  get kind() {
    return "Player" as const;
  }
}
