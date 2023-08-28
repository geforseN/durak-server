import { GameRound } from ".";
import type DurakGame from "../DurakGame";
import { NonEmptyPlayers } from "./Player/NonEmptyPlayers";

export abstract class RoundEnd {
  constructor(protected game: DurakGame) {}

  prepareBeforeNewGameRound() {
    if (this.game.talon.isEmpty) {
      this.game.players = new NonEmptyPlayers(this.game);
      if (this.game.players.count === 1) {
        throw new Error("One player remained. Game must be over");
      }
    } else {
      this.game.distribution.makeDistribution();
    }
  }

  abstract get newGameRound(): GameRound | undefined;
}
