import { Card as CardDTO } from "@durak-game/durak-dts";
import assert from "node:assert";

import type DurakGame from "../../DurakGame.js";

import NotificationAlert from "../../../NotificationAlert/index.js";
import { AllowedPlayerBadInputError } from "../../error/index.js";

export async function stopMoveListener(this: {
  game: DurakGame;
  playerId: string;
}) {
  try {
    const player = this.game.players.get(
      (player) => player.id === this.playerId,
    );
    assert.strict.equal(player, this.game.players.allowed);
    await player.makeNewMove();
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
    const player = this.game.players.get(
      (player) => player.id === this.playerId,
    );
    assert.strict.equal(player, this.game.players.allowed);
    await player.makeNewMove(card, slotIndex);
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
