import DurakGame from "../../../durak-game/DurakGame";
import { ensureCanStopMove } from "../assert";
import { getPlayer } from "../getter";

export default function handleStopMove(
  this: { game: DurakGame, playerId: string }
) {
  const { game, playerId: id } = this;
  const player = getPlayer(game, id);
  ensureCanStopMove(game);
  if (game.players.isSuperPlayer(player)) {
    player.stopMove({ game });
  } else throw new Error("Нет права закончить ход");
}

