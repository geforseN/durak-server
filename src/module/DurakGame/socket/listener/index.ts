import { Card as CardDTO, type DurakGameSocket } from "@durak-game/durak-dts";
import assert from "node:assert";

import type DurakGame from "@/module/DurakGame/DurakGame.js";

import NotificationAlert from "@/module/NotificationAlert/index.js";
import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";

export async function stopMoveListener(
  io: DurakGameSocket.Namespace,
  game: DurakGame,
  playerId: string,
) {
  try {
    const player = game.players.get((player) => player.id === playerId);
    assert.strict.equal(player, game.players.allowed);
  } catch (error) {
    if (error instanceof AllowedPlayerBadInputError) {
      return io
        .to(playerId)
        .emit("notification::push", error.asNotificationAlert);
    }
    assert.ok(error instanceof Error);
    io.to(playerId).emit("notification::push", new NotificationAlert(error));
  }
}

export async function cardPlaceListener(
  io: DurakGameSocket.Namespace,
  game: DurakGame,
  playerId: string,
  card: CardDTO,
  slotIndex: number,
) {
  try {
    const player = game.players.get((player) => player.id === playerId);
    assert.strict.equal(player, game.players.allowed);
  } catch (error) {
    if (error instanceof AllowedPlayerBadInputError) {
      return io
        .to(playerId)
        .emit("notification::push", error.asNotificationAlert);
    }
    assert.ok(error instanceof Error);
    io.to(playerId).emit("notification::push", new NotificationAlert(error));
  }
}
