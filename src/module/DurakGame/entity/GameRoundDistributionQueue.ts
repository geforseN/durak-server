import type { AllowedMissingCardCount } from "@durak-game/durak-dts";

import assert from "node:assert";

import type DurakGame from "../DurakGame.js";
import type { BasePlayer } from "./Player/BasePlayer.abstract.js";

export default class GameRoundDistribution {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  makeDistribution() {
    for (const player of this.playersQueue()) {
      if (this.game.talon.isEmpty) {
        return;
      }
      this.game.talon.provideCards(player);
    }
  }

  makeInitialDistribution() {
    for (const player of this.game.players) {
      const { finalCardCount } = this.game.settings.initialDistribution;
      this.game.talon.provideCards(
        player,
        (finalCardCount - player.hand.count) as AllowedMissingCardCount,
      );
    }
  }

  *playersQueue() {
    const { defender } = this.game.players;
    const { primalAttackerAsLatest } = this.game.round;
    assert.strictEqual(defender.right, primalAttackerAsLatest);
    yield defender.right;
    // yield primalAttackerAsLatest;
    let player: BasePlayer = defender;
    while ((player = player.left) !== primalAttackerAsLatest) {
      yield player;
    }
    yield defender;
  }
}
