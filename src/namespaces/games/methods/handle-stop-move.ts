import DurakGame from "../../../durak-game/durak-game";
import { GameSocket } from "../game.service";

export default function handleStopMove(
  this: { game: DurakGame, accname: string } & GameSocket
) {
  const { game, accname } = this;
  const player = game.players.tryGetPlayer({ accname });
  if (!game.round.__canMakeMove(player)) throw new Error("Нет права ходить");
  if (game.desk.isEmpty) throw new Error("Нельзя закончить раунд с пустым столом");
  if (game.players.isDefender(player) || game.players.isAttacker(player)) {
    player.stopMove({ game });
  } else throw new Error("Нет права");
}
