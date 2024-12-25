import type DurakGame from "@/module/DurakGame/DurakGame.js";

import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import GameRoundMoves from "@/module/DurakGame/entity/GameRound/GameRoundMoves.js";

export default class GameRound {
  readonly game: DurakGame;
  readonly moves: GameRoundMoves;
  readonly number: number;

  constructor(game: DurakGame, moves = new GameRoundMoves()) {
    this.game = game;
    this.number = (game.round?.number || 0) + 1;
    this.moves = moves;
    this.makeEmitAboutStart();
  }

  makeEmitAboutStart() {
    this.game.info.namespace.emit("round::new", {
      round: { number: this.number },
    });
    return this;
  }

  nextRound() {
    return new GameRound(this.game)
  }

  toJSON() {
    return { number: this.number };
  }

  // so, because primal attacker incapsulated DurakGame instance on it is creation
  get betterNextAttacker() {
    return this.primalAttackerAsLatest.isAttacker()
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }

  get nextAttacker(): BasePlayer {
    return this.game.players.attacker.id === this.primalAttacker.id
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }

  // it is better to return a super class than a sub class
  get primalAttacker(): BasePlayer | never {
    return this.moves.primalMove.performer as BasePlayer;
  }

  // than now  primal attacker can get own latest instance in incapsulated game
  get primalAttackerAsLatest(): BasePlayer {
    return this.moves.primalMove.performer.asLatest();
  }
}
