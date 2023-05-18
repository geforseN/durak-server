import DurakGame from "../../../module/durak-game/DurakGame";
import { getPlayer } from "../getter";
import assert from "node:assert";

export default function handleStopMove(
  this: { game: DurakGame, playerId: string }
) {
  const { game, playerId: id } = this;
  const player = getPlayer(game, id);
  assert.ok(!game.desk.isEmpty, "Нельзя закончить раунд с пустым столом");
  assert.ok(game.players.isSuperPlayer(player), "Нет права закончить ход");
  clearTimeout(game.round.currentMove.defaultBehaviour);
  game.round.currentMove.stopMove();
}

