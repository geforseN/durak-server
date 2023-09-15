import type DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";
import { GameMove } from "../../entity/GameMove/index.js";
import { RoundEnd } from "../../entity/DefenseEnding/RoundEnd.js";

// FIXME: rename function below
export function makeMagic(
  this: { game: DurakGame },
  move: GameMove<AllowedSuperPlayer>,
) {
  if (move.isInsertMove()) {
    move.makeCardInsert();
  }
  const nextThing = move.gameMutationStrategy();
  this.game.round.moves.push(move);
  if (nextThing instanceof RoundEnd) {
    const { newGameRound } = nextThing;
    if (!newGameRound) {
      return this.game.end();
    }
    this.game.round = newGameRound;
  } else {
    this.game.players.allowedPlayer.setTimer();
  }
}
