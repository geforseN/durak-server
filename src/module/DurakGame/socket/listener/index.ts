import handlePutCardOnDesk from "../handler/handle-put-card-on-desk.js";
import handleStopMove from "../handler/handle-stop-move.js";
import DurakGame from "../../DurakGame.js";
import NotificationAlert from "../../../NotificationAlert/index.js";
import assert from "node:assert";
import { Card as CardDTO } from "@durak-game/durak-dts";

export function stopMoveListener(this: { game: DurakGame; playerId: string }) {
  try {
    handleStopMove.call(this);
  } catch (error) {
    assert.ok(error instanceof Error);
    this.game.info.namespace
      .to(this.playerId)
      .emit("notification::push", new NotificationAlert(error));
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
      .emit("notification::push", new NotificationAlert(error));
  }
}
