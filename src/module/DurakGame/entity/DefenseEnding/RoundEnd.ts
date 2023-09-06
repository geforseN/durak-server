import { GameRound } from "..";
import type DurakGame from "../../DurakGame";
import { NonEmptyPlayers } from "../Players/NonEmptyPlayers";

export abstract class RoundEnd {
  constructor(protected game: DurakGame) {}

  kind = "RoundEnd" as const;

  prepareBeforeNewGameRound() {
    if (this.game.talon.isEmpty) {
      this.game.players = new NonEmptyPlayers(this.game);
      if (this.game.players.count === 1) {
        throw new Error("One player remained. Game must be over");
      } else if (this.game.players.count === 1) {
        throw new Error("Game must be ended wit a draw");
      }
    } else {
      this.game.distribution.makeDistribution();
    }
  }

  abstract get newGameRound(): GameRound | undefined;
}
