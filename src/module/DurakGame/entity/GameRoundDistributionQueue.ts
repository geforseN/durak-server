import assert from "node:assert";
import type DurakGame from "../DurakGame";
import { Player } from "./__Player";

export default class GameRoundDistribution {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  *playersQueue() {
    const { primalAttacker } = this.game.round;
    const { defender: defender } = this.game.players;
    yield primalAttacker;
    assert.strictEqual(primalAttacker.left, defender);
    let player: Player = defender;
    while ((player = player.left) !== primalAttacker) {
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
