import handlePutCardOnDesk from "../handler/handle-put-card-on-desk";
import handleStopMove from "../handler/handle-stop-move";
import DurakGame from "../../DurakGame.implimetntation";
import { CardDTO } from "../../DTO";
import NotificationAlert from "../../../notification-alert";
import assert from "node:assert";

export function stopMoveListener(this: { game: DurakGame; playerId: string }) {
  try {
    handleStopMove.call(this);
  } catch (error) {
    assert.ok(error instanceof Error);
    this.game.info.namespace
      .to(this.playerId)
      .emit("notification__send", new NotificationAlert(error));
  }
}

export async function cardPlaceListener(
  this: { game: DurakGame; playerId: string },
  card: CardDTO,
  slotIndex: number,
) {
  try {
    await handlePutCardOnDesk.call(this, card, slotIndex);
  } catch (error) {
    assert.ok(error instanceof Error);
    this.game.info.namespace
      .to(this.playerId)
      .emit("notification__send", new NotificationAlert(error));
  }
}
