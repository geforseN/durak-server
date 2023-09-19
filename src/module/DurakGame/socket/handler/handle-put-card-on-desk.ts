import type { CardDTO } from "@durak-game/durak-dts";

import type DurakGame from "../../DurakGame.js";
import type { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  cardDTO: CardDTO,
  slotIndex: number,
) {
  const player = this.game.players.get<AllowedSuperPlayer>(
    (player): player is AllowedSuperPlayer =>
      player.id === this.playerId && player.isAllowed(),
    "У вас нет права хода",
  );
  await player.makeNewMove(cardDTO, slotIndex);
}
