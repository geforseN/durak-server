import type DurakGame from "../../DurakGame";
import { type CardDTO } from "../../DTO";
import { type SuperPlayer } from "../../entity/Player";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  cardDTO: CardDTO,
  slotIndex: number,
) {
  this.game.round.currentMove.defaultBehavior.shouldBeCalled = false;
  try {
    await this.game.players
      .get<SuperPlayer>(
        (player): player is SuperPlayer =>
          player.id === this.playerId &&
          this.game.round.currentMove.player === player,
        "У вас нет права хода",
      )
      .putCardOnDesk(this.game.round, cardDTO, slotIndex);
  } catch (error) {
    this.game.round.currentMove.defaultBehavior.shouldBeCalled = true;
    throw error;
  }
}
