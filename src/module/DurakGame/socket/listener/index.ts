import handlePutCardOnDesk from "../handler/handle-put-card-on-desk";
import handleStopMove from "../handler/handle-stop-move";
import DurakGame from "../../DurakGame.implimetntation";
import { CardDTO } from "../../DTO";

export function stopMoveListener(
  this: { game: DurakGame, playerId: string }
) {
  try {
    handleStopMove.call(this);
  } catch (error) {
    this.game.#wsService?.handleError({ playerId: this.playerId, error });
  }
}

export async function cardPlaceListener(
  this: { game: DurakGame, playerId: string },
  card: CardDTO,
  slotIndex: number,
) {
  try {
    await handlePutCardOnDesk.call(this, card, slotIndex);
  } catch (error) {
    this.game.#wsService?.handleError({ playerId: this.playerId, error });
  }
}