import { GameRound } from "./index.js";

export default class GameHistory {
  players: {};
  rounds;

  constructor(players, rounds: GameHistoryRounds = new GameHistoryRounds()) {
    this.players;
    this.rounds = rounds
  }

  get leftPlayers() {}
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
