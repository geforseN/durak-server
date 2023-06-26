import { getPlayer, getPlacedCard } from "../getter";
import DurakGame from "../../DurakGame.implimetntation";
import { CardDTO } from "../../DTO";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame, playerId: string },
  { suit, rank }: CardDTO,
  slotIndex: number,
) {
  const { game, playerId: id } = this;
  const player = getPlayer(game, id);
  const card = getPlacedCard({ suit, rank }, game, player);
  if (game.players.isDefender(player)
    && await game.round.currentMove.allowsTransferMove(card, slotIndex)) {
    return game.round.makeTransferMove(card, slotIndex);
  }
  clearTimeout(game.round.currentMove.defaultBehaviour);
  return await game.round.currentMove.putCardOnDesk(card, slotIndex);
}
