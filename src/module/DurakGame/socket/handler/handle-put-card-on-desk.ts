import { getPlayer, getCard } from "../getter";
import DurakGame from "../../DurakGame.implimetntation";
import { CardDTO } from "../../DTO";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  { suit, rank }: CardDTO,
  slotIndex: number,
) {
  const { game, playerId } = this;
  const player = getPlayer(game, playerId);
  const card = getCard({ suit, rank }, game, player);
  if (
    player.isDefender &&
    (await game.round.currentMove.allowsTransferMove(card, slotIndex))
  ) {
    return game.round.makeTransferMove(card, slotIndex);
  }
  clearTimeout(game.round.currentMove.defaultBehaviour);
  return await game.round.currentMove.putCardOnDesk(card, slotIndex);
}
