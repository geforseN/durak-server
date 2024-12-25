import type NonStartedGameUser from "@/module/DurakGame/entity/Player/NonStartedGameUser.js";

import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export class Player {
  constructor(basePlayer: BasePlayer) {
    super(basePlayer);
  }

  static create(user: NonStartedGameUser): [number, Player, number] {
    return [
      user.leftPlayerIndex,
      new Player({
        hand: user.hand,
        info: user.info,
        left: undefined,
        right: undefined,
      }),
      user.rightPlayerIndex,
    ];
  }

  get kind() {
    return "Player" as const;
  }
}
