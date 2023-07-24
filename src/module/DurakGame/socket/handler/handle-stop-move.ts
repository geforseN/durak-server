import assert from "node:assert";
import DurakGame from "../../DurakGame.implimetntation";
import { SuperPlayer } from "../../entity/Player";

export default function handleStopMove(this: {
  game: DurakGame;
  playerId: string;
}) {
  try {
    this.game.round.currentMove.defaultBehaviour.shouldBeCalled = false;
    assert.ok(
      !this.game.desk.isEmpty,
      "Нельзя закончить раунд с пустым столом",
    );
    this.game.players
      .get<SuperPlayer>(
        (player): player is SuperPlayer =>
          player.id === this.playerId &&
          this.game.round.currentMove.player === player,
        "Нет права закончить ход",
      )
      .stopMove(this.game.round.currentMove);
  } catch (error) {
    this.game.round.currentMove.defaultBehaviour.shouldBeCalled = true;
    throw error;
  }
}
