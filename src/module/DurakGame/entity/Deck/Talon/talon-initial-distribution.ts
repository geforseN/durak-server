import type Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";
import type BasePlayer from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export default class TalonInitialDistribution {
  constructor(
    readonly talon: Talon,
    readonly finalHandCardCount: number,
    readonly players: BasePlayer[],
  ) {}

  execute() {
    const { finalHandCardCount, talon } = this;
    for (const player of this.players) {
      const count = finalHandCardCount - player.hand.count;
      talon.cards.provide(player, count);
    }
  }
}
