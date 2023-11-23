import { BasePlayer } from "./Player/BasePlayer.abstract.js";
import { GameRound } from "./index.js";
export default class GameHistory {
  players;
  rounds;

  constructor(
    players: BasePlayer[],
    rounds: GameHistoryRounds = new GameHistoryRounds(),
  ) {
    this.players = players;
    this.rounds = rounds;
  }
}

class GameHistoryRounds {
  value: GameRound[] = [];

  constructor(rounds: GameRound[] = []) {
    this.value = rounds;
  }

  add(round: GameRound) {
    this.value.push(round);
  }
}
