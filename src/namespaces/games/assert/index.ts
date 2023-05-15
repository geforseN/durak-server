import DurakGame from "../../../durak-game/DurakGame";
import Card from "../../../durak-game/entity/Card";
import { Player } from "../../../durak-game/entity/Players";


export function ensureIsAllowedToMove(player: Player, game: DurakGame) {
  if (!game.round.isCurrentMoveAllowedTo(player)) {
    throw new Error("У вас нет права ходить");
  }
}

export function ensureHasCard(player: Player, card: Pick<Card, "rank" | "suit">) {
  if (!player.hand.has({ card })) {
    throw new Error("У вас нет такой карты");
  }
}

export function ensureCanStopMove(game: DurakGame) {
  if (game.desk.isEmpty) {
    throw new Error("Нельзя закончить раунд с пустым столом");
  }
}