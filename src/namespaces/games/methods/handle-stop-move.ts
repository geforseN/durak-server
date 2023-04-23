import DurakGame from "../../../durak-game/DurakGame";

export default function handleStopMove(
  this: { game: DurakGame, accname: string }
) {
  const { game, accname: id } = this;
  if (game.round.currentMove.player.id !== id) {
    throw new Error("Нет права ходить");
  }
  if (game.desk.isEmpty) {
    throw new Error("Нельзя закончить раунд с пустым столом");
  }
  const player = game.players.getPlayer({ id });
  if (game.players.isSuperPlayer(player)) {
    player.stopMove({ game });
  } else throw new Error("Нет права");
}
