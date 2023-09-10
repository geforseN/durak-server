import assert from "node:assert";
import DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";

export default function handleStopMove(this: {
  game: DurakGame;
  playerId: string;
}) {
  try {
    assert.ok(
      !this.game.desk.isEmpty,
      "Нельзя закончить раунд с пустым столом",
    );
    this.game.players
      .get<AllowedSuperPlayer & { makeStopMove: Function }>(
        (player): player is AllowedSuperPlayer & { makeStopMove: Function } =>
          player.id === this.playerId && player.isAllowed(),
        "Нет права закончить ход",
      )
      .makeStopMove();
  } catch (error) {
    throw error;
  }
}
