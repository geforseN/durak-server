import type DurakGame from "./DurakGame.implimetntation";
import { Player } from "./entity/Player";

// TODO refactor
export default class GameRoundDistributionQueue {
  game: DurakGame;
  playersQueue: Player[];

  constructor(game: DurakGame) {
    this.game = game;
    // TODO refactor
    this.playersQueue = this.#makeDistributionQueue();
  }

  #makeDistributionQueue() {
    const playersQueue: Player[] = [this.game.players.defender.right];
    let player = this.game.players.defender.left;
    while (player.id !== this.game.round.primalAttacker.id) {
      playersQueue.push(player);
      player = player.left;
    }
    playersQueue.push(this.game.players.defender);
    return playersQueue;
  }

  makeDistribution() {
    const distributionQueue = this.playersQueue
      // TODO remove mapping if assert will never happen
      .map((distributionPlayer) => {
        const player = this.game.players.get(
          (player) => player.id === distributionPlayer.id,
        );
        console.assert(
          distributionPlayer === player,
          "DISTRIBUTION %s QUEUE",
          player.id,
        );
        return player;
      });
    for (const player of distributionQueue) {
      if (this.game.talon.isEmpty) return;
      this.game.talon.provideCards(player);
    }
  }

  // TODO refactor
  makeInitialDistribution() {
    const { finalCardCount, cardCountPerIteration: cardCount } =
      this.game.settings.initialDistribution;
    const finalCardCountToDistribute = this.game.players.count * finalCardCount;
    for (
      let givenCardCount = 0;
      givenCardCount < finalCardCountToDistribute;
      givenCardCount += cardCount
    ) {
      const playerIndex =
        (givenCardCount / cardCount) % this.game.players.count;
      const player = [...this.game.players][playerIndex];
      this.game.talon.provideCards(player, cardCount);
    }
  }
}
