import assert from "node:assert";
import type DurakGame from "./DurakGame.implimetntation";
import { Player } from "./entity/Player";

export default class GameRoundDistributionQueue {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  get playersQueue() {
    const { primalAttacker } = this.game.round;
    const playersQueue: Player[] = [primalAttacker];
    assert.strictEqual(primalAttacker.left, this.game.players.defender);
    let player = primalAttacker.left as Player;
    while ((player = player.left) !== primalAttacker) {
      playersQueue.push(player);
    }
    playersQueue.push(primalAttacker.left);
    return playersQueue;
  }

  makeDistribution() {
    for (const player of this.playersQueue) {
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
