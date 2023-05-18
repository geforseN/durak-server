import DurakGame from "../../../module/durak-game/DurakGame";
import Card from "../../../module/durak-game/entity/Card";
import handlePutCardOnDesk from "../methods/handle-put-card-on-desk";
import handleStopMove from "../methods/handle-stop-move";

export function stopMoveListener(this: { game: DurakGame, playerId: string }) {
  try {
    handleStopMove.call(this);
  } catch (error) {
    console.trace(error);
    const { game, playerId } = this;
    game.service?.handleError({ playerId, error });
  }
}

export async function cardPlaceListener(
  this: { game: DurakGame, playerId: string },
  card: Pick<Card, "rank" | "suit">,
  slotIndex: number,
) {
  try {
    await handlePutCardOnDesk.call(this, card, slotIndex);
  } catch (error) {
    console.trace(error);
    const { game, playerId } = this;
    game.service?.handleError({ playerId, error });
  }
}