import type Talon from "@/module/DurakGame/entity/Deck/Talon/index.js";
import type Player from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export default class TalonInitialDistribution {
  constructor(
    private readonly talon: Talon,
    private readonly finalHandCardCount: number,
    private readonly players: Player[],
  ) {}

  execute() {
    const { finalHandCardCount, talon } = this;
    for (const player of this.players) {
      talon.cards.provide(player.cards, finalHandCardCount);
    }
  }
}
