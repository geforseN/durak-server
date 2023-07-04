import DurakGame from "../../DurakGame.implimetntation";
import { CardDTO } from "../../DTO";
import { SuperPlayer } from "../../entity/Player";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  { suit, rank }: CardDTO,
  slotIndex: number,
) {
  const { game, playerId } = this;
  const player = game.players.get(
    (player): player is SuperPlayer =>
      player.id === playerId && game.round.currentMove.player === player,
    "У вас нет права хода",
  );
  const card = player.hand.get({ suit, rank });
  // TODO refactor player.isAllowedToTransferMove && game.desk.allowsTransferMove
  // OR try {game.round.makeTranferMove} catch {game.round.currentMove.putCardOnDesk}
  if (
    player.isDefender &&
    (await game.round.currentMove.allowsTransferMove(card, slotIndex))
  ) {
    clearTimeout(game.round.currentMove.defaultBehaviour);
    return game.round.makeTransferMove(card, slotIndex);
  }
  clearTimeout(game.round.currentMove.defaultBehaviour);
  return await game.round.currentMove.putCardOnDesk(card, slotIndex);
}
