import type DurakGame from "./DurakGame.implimetntation";
import { Player } from "./entity/Player";

export default class GameRoundDistributionQueue {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  makeDistribution() {
    const playersQueue: Player[] = [this.game.players.defender.right];
    let player = this.game.players.defender.left;
    while (!player.isPrimalAttacker({ round: this.game.round })) {
      playersQueue.push(player);
      player = player.left;
    }
    playersQueue.push(this.game.players.defender);
    return playersQueue;
  }
}
