import assert from "node:assert";
import type DurakGame from "./DurakGame.implimetntation";
import { Player } from "./entity/Player";

export default class GameRoundDistributionQueue {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  *playersQueue() {
    const { primalAttacker } = this.game.round;
    const { defender } = this.game.players;
    yield primalAttacker;
    assert.strictEqual(primalAttacker.left, defender);
    let player = defender as Player;
    while ((player = player.left) !== primalAttacker) {
      yield player;
    }
    yield defender;
  }

  makeDistribution() {
    for (const player of this.playersQueue()) {
      if (this.game.talon.isEmpty) return;
      this.game.talon.provideCards(player);
    }
  }

  makeInitialDistribution() {
    const { finalCardCount, cardCountPerIteration } =
      this.game.settings.initialDistribution;
    const numberOfIterations = finalCardCount / cardCountPerIteration;
    let [player] = this.game.players;
    assert.ok(player);
    for (let i = 0; i < numberOfIterations; i++, player = player.left) {
      this.game.talon.provideCards(player, cardCountPerIteration);
    }
  }
}
