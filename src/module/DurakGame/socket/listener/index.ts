import { Card as CardDTO } from "@durak-game/durak-dts";
import assert from "node:assert";

import type DurakGame from "@/module/DurakGame/DurakGame.js";

import NotificationAlert from "@/module/NotificationAlert/index.js";
import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";

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
    assert.ok(error instanceof Error);
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
    assert.ok(error instanceof Error);
  }
}
