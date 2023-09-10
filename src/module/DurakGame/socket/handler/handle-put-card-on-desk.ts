import type DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";

import type { Card as CardDTO } from "@durak-game/durak-dts";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  cardDTO: CardDTO,
  slotIndex: number,
) {
  try {
    await this.game.players
      .get<AllowedSuperPlayer & {makeInsertMove: Function}>(
        (player): player is AllowedSuperPlayer & {makeInsertMove: Function} =>
          player.id === this.playerId && player.isAllowed(),
        "У вас нет права хода",
      )
      .makeInsertMove(cardDTO, slotIndex);
  } catch (error) {
    throw error;
  }
}
