import assert from "node:assert";
import DurakGame from "../../DurakGame.js";
 import { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";

export default function handleStopMove(this: {
  game: DurakGame;
  playerId: string;
}) {
  try {
    this.game.round.currentMove.defaultBehavior.shouldBeCalled = false;
    assert.ok(
      !this.game.desk.isEmpty,
      "Нельзя закончить раунд с пустым столом",
    );
    this.game.players
      .get<AllowedSuperPlayer & { makeStopMove: Function }>(
        (player): player is AllowedSuperPlayer & { makeStopMove: Function } =>
          player.id === this.playerId &&
          this.game.players.allowedPlayer.id === player.id,
        "Нет права закончить ход",
      )
      .makeStopMove();
  } catch (error) {
    this.game.round.currentMove.defaultBehavior.shouldBeCalled = true;
    throw error;
  }
}
