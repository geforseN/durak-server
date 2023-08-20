import { GameRound, Players } from ".";
import GameRoundDistributionQueue from "./GameRoundDistributionQueue";
import type DurakGame from "../DurakGame";

export abstract class RoundEnd {
  constructor(protected game: DurakGame) {}

  prepareBeforeNewGameRound() {
    if (this.game.talon.isEmpty) {
      this.game.players = new Players(this.game);
      if (this.game.players.count === 1) {
        throw new Error("One player remained. Game must be over");
      }
    } else {
      new GameRoundDistributionQueue(this.game).makeDistribution();
    }
  }

  abstract get newGameRound(): GameRound | undefined;
}
