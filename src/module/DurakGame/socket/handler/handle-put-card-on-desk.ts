import type DurakGame from "../../DurakGame.implimetntation";
import { type CardDTO } from "../../DTO";
import { Attacker, Defender, type SuperPlayer } from "../../entity/Player";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  cardDTO: CardDTO,
  slotIndex: number,
) {
  this.game.round.currentMove.defaultBehaviour.shouldBeCalled = false;
  try {
    // TODO remove излишнее instanceof check
    await this.game.players
      .get<SuperPlayer>(
        (player): player is SuperPlayer =>
          player.id === this.playerId &&
          this.game.round.currentMove.player === player &&
          (player instanceof Attacker || player instanceof Defender),
        "У вас нет права хода",
      )
      .putCardOnDesk(this.game.round.currentMove, cardDTO, slotIndex);
  } catch (error) {
    this.game.round.currentMove.defaultBehaviour.shouldBeCalled = true;
    throw error;
  }
}
