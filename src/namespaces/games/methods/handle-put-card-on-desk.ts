import Card from "../../../durak-game/entity/Card";
import DurakGame from "../../../durak-game/DurakGame";
import { getPlayer, getPlacedCard } from "../getter";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame, playerId: string },
  { suit, rank }: Pick<Card, "rank" | "suit">,
  index: number,
) {
  const { game, playerId: id } = this;
  const player = getPlayer(game, id);
  const card = getPlacedCard({ suit, rank }, game, player);
  if (
    game.players.isDefender(player)
    && await game.desk.allowsTransferMove({ index, card, nextDefender: player.left })
  ) {
    return player.makeTransferMove({ game, index, card });
  }
  if (game.players.isSuperPlayer(player)) {
    return await player.putCardOnDesk({ game, index, card });
  } else throw new Error("У вас нет прав ложить карту на стол");
}
