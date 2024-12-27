import type NonStartedGameUser from "@/module/DurakGame/entity/Player/NonStartedGameUser.js";

import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

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
      }),
      user.rightPlayerIndex,
    ];
  }

  get kind() {
    return "Player" as const;
  }
}
