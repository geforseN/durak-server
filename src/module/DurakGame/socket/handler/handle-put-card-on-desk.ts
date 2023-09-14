import type DurakGame from "../../DurakGame.js";
import { type AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";
import type { Card as CardDTO } from "@durak-game/durak-dts";
import { makeMagic } from "./makeMagic.js";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame; playerId: string },
  cardDTO: CardDTO,
  slotIndex: number,
) {
  try {
    const player = this.game.players.get<AllowedSuperPlayer>(
      (player): player is AllowedSuperPlayer =>
        player.id === this.playerId && player.isAllowed(),
      "У вас нет права хода",
    );
    const card = player.hand.get((card) =>
      card.hasSame({ rank: cardDTO.rank, suit: cardDTO.suit }),
    );
    const slot = this.game.desk.slotAt(slotIndex);
    makeMagic.call(this, await player.makeInsertMove(card, slot));
  } catch (error) {
    throw error;
  }
}


