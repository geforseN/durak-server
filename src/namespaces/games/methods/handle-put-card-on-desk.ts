import CardDTO from "../../../durak-game/DTO/Card.dto";
import DurakGame from "../../../durak-game/DurakGame";
import { getPlayer, getPlacedCard } from "../getter";
import assert from "node:assert";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame, playerId: string },
  { suit, rank }: CardDTO,
  slotIndex: number,
) {
  const { game, playerId: id } = this;
  const player = getPlayer(game, id);
  const card = getPlacedCard({ suit, rank }, game, player);
  if (
    game.players.isDefender(player)
    && await game.desk.allowsTransferMove({ index: slotIndex, card, nextDefender: player.left })
  ) {
    return player.makeTransferMove({ game, index, card });
  }
  assert.ok(game.players.isSuperPlayer(player), "У вас нет прав ложить карту на стол");
  clearTimeout(game.round.currentMove.defaultBehaviour);
  return await game.round.currentMove.putCardOnDesk(card, slotIndex);
}
