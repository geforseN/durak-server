import assert from "node:assert";
import type DurakGame from "../DurakGame.js";
import { BasePlayer } from "./Player/BasePlayer.abstract.js";

export default class GameRoundDistribution {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  *playersQueue() {
    const { latestPrimalAttacker } = this.game.round;
    const { defender: defender } = this.game.players;
    yield latestPrimalAttacker;
    assert.strictEqual(latestPrimalAttacker.left, defender);
    let player: BasePlayer = defender;
    while ((player = player.left) !== latestPrimalAttacker) {
      yield player;
    }
    yield defender;
  }

  makeDistribution() {
    for (const player of this.playersQueue()) {
      if (this.game.talon.isEmpty) return this;
      this.game.talon.provideCards(player);
    }
    return this;
  }

  makeInitialDistribution() {
    const { finalCardCount, cardCountPerIteration } =
      this.game.settings.initialDistribution;
    const numberOfIterations =
      (finalCardCount / cardCountPerIteration) * this.game.players.count;
    let [player] = this.game.players;
    for (let i = 0; i < numberOfIterations; i++, player = player.left) {
      this.game.talon.provideCards(player, cardCountPerIteration);
    }
    return this;
  }
}
