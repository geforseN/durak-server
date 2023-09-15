import handlePutCardOnDesk from "../handler/handle-put-card-on-desk.js";
import handleStopMove from "../handler/handle-stop-move.js";
import DurakGame from "../../DurakGame.js";
import NotificationAlert from "../../../NotificationAlert/index.js";
import assert from "node:assert";
import { Card as CardDTO } from "@durak-game/durak-dts";
import { AllowedPlayerBadInputError } from "../../error/index.js";

export function stopMoveListener(this: { game: DurakGame; playerId: string }) {
  try {
    handleStopMove.call(this);
  } catch (error) {
    if (error instanceof AllowedPlayerBadInputError) {
      return this.game.info.namespace
        .to(this.playerId)
        .emit("notification::push", error.asNotificationAlert);
    }
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
    if (error instanceof AllowedPlayerBadInputError) {
      return this.game.info.namespace
        .to(this.playerId)
        .emit("notification::push", error.asNotificationAlert);
    }
    assert.ok(error instanceof Error);
    this.game.info.namespace
      .to(this.playerId)
      .emit("notification::push", new NotificationAlert(error));
  }
}
