import type DurakGame from "../../DurakGame.js";
import { BasePlayer } from "../Player/BasePlayer.abstract.js";
import GameRoundMoves from "./GameRoundMoves.js";

export default class GameRound {
  readonly number: number;
  readonly moves: GameRoundMoves;
  readonly game: DurakGame;

  constructor(game: DurakGame, moves = new GameRoundMoves()) {
    this.game = game;
    this.number = (game.round?.number || 0) + 1;
    this.moves = moves;
    this.makeEmitAboutStart();
  }

  makeEmitAboutStart() {
    this.game.info.namespace.emit("round::new", {
      roundNumber: this.number,
    });
    return this;
  }

  // NOTE: primal attacker may not exist
  // IF primal attacker does not exist THEN this.moves.primalAttackerMove will throw
  // primal attacker may not exist because every move in game is transfer move (transfer can exist in perevodnoy durak)
  // NOTE: primalAttacker actually can be not allowed for move in current time
  // but in past time primalAttacker was allowed
  // EXAMPLE:
  // true => this.moves.primalAttackerMove.performer instanceof AllowedAttacker
  // maybe => this.moves.primalAttackerMove.performer.asLatest() instanceof AllowedAttacker
  // this is why type cast is used for return value
  // it is better to return a super class than a sub class
  get primalAttacker(): BasePlayer | never {
    return this.moves.primalMove.performer as BasePlayer;
  }

  // so, because primal attacker incapsulated DurakGame instance on it is creation
  // than now  primal attacker can get own latest instance in incapsulated game
  get latestPrimalAttacker(): BasePlayer {
    return this.moves.primalMove.performer.asLatest();
  }

  get nextAttacker(): BasePlayer {
    return this.game.players.attacker.id === this.primalAttacker.id
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }

  get betterNextAttacker() {
    return this.latestPrimalAttacker.isAttacker()
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }

  get isAllowsTransferMove() {
    try {
      this.moves.firstRealDefenderMove;
      return false;
    } catch {
      return true;
    }
  }

  toJSON() {
    return { number: this.number };
  }
}
