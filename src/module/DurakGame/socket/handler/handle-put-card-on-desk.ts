import type DurakGame from "../../DurakGame";
import { type SuperPlayer } from "../../entity/__Player";
import { CanMakeMove } from "../../entity/__Player/Player";
import type { Card as CardDTO } from "@durak-game/durak-dts";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  cardDTO: CardDTO,
  slotIndex: number,
) {
  this.game.round.currentMove.defaultBehavior.shouldBeCalled = false;
  try {
    await this.game.players
      .get<SuperPlayer & CanMakeMove>(
        (player): player is SuperPlayer & CanMakeMove =>
          player.id === this.playerId && player.isAllowed(),
        "У вас нет права хода",
      )
      .makeInsertMove(cardDTO, slotIndex);
  } catch (error) {
    this.game.round.currentMove.defaultBehavior.shouldBeCalled = true;
    throw error;
  }
}
