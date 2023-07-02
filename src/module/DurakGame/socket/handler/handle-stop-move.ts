import assert from "node:assert";
import { getPlayer } from "../getter";
import DurakGame from "../../DurakGame.implimetntation";

export default function handleStopMove(this: {
  game: DurakGame;
  playerId: string;
}) {
  const { game, playerId } = this;
  const player = getPlayer(game, playerId);
  assert.ok(!game.desk.isEmpty, "Нельзя закончить раунд с пустым столом");
  assert.ok(player.isSuperPlayer, "Нет права закончить ход");
  clearTimeout(game.round.currentMove.defaultBehaviour);
  game.round.currentMove.stopMove();
}
