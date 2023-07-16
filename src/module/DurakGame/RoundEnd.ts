import { Players } from "./entity";
import GameRoundDistributionQueue from "./GameRoundDistributionQueue";
import type DurakGame from "./DurakGame.implimetntation";

export abstract class RoundEnd {
  constructor(protected game: DurakGame) {}

  prepareBeforeNewGameRound() {
    if (this.game.talon.isEmpty) {
      this.game.players = new Players(this.game.players);
      if (this.game.players.count !== 1) return;
      throw new Error("Game should be end");
    } else {
      new GameRoundDistributionQueue(this.game).makeDistribution();
    }
  }

  abstract pushNewRound(): void;
}
