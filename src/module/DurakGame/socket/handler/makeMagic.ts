import type DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";
import { GameMove } from "../../entity/GameMove/index.js";

// FIXME: rename function below
export function makeMagic(
  this: { game: DurakGame },
  move: GameMove<AllowedSuperPlayer>,
) {
  this.game.round.moves.push(move);
  const nextThing = move.calculateNextThingToDoInGame();
  move.emitContextToPlayers();
  if (nextThing.kind === "RoundEnd") {
    const { newGameRound } = nextThing;
    if (!newGameRound) {
      return this.game.end();
    }
    this.game.round = newGameRound;
    return;
  } else {
    const allowedPlayer = nextThing;
    allowedPlayer.setTimer();
  }
}
