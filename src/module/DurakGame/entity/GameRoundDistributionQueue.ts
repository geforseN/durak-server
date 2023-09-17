import type { AllowedMissingCardCount } from "@durak-game/durak-dts";

import assert from "node:assert";

import type DurakGame from "../DurakGame.js";

import { BasePlayer } from "./Player/BasePlayer.abstract.js";

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
    const { latestPrimalAttacker } = this.game.round;
    const { defender } = this.game.players;
    yield latestPrimalAttacker;
    assert.strictEqual(latestPrimalAttacker.left, defender);
    let player: BasePlayer = defender;
    while ((player = player.left) !== latestPrimalAttacker) {
      yield player;
    }
    yield defender;
  }
}
