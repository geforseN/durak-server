import { Player } from "../Player";
import { AttackerMove, DefenderMove } from "../GameMove";
import type DurakGame from "../../DurakGame";
import GameRoundMoves from "./GameRoundMoves";
import { AfterHandler } from "../GameMove/GameMove.abstract";
import FailedDefense from "../Defense/FailedDefense";
import SuccessfulDefense from "../Defense/SuccessfulDefense";
import { raise } from "../../../..";

export default class GameRound {
  readonly number: number;
  readonly moves: GameRoundMoves;
  readonly game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
    this.number = !game.round ? 1 : game.round.number + 1;
    this.moves = new GameRoundMoves();
    this.giveAttackTo(game.players.attacker);
  }

  endWith(Defense: typeof FailedDefense | typeof SuccessfulDefense) {
    this.game.round =
      new Defense(this.game).newGameRound || raise("Update round error");
  }

  giveAttackTo(player: Player) {
    this.game.round.moves.nextMove = new AttackerMove(this.game, {
      performer: player,
    });
  }

  giveDefendTo(player: Player) {
    this.game.round.moves.nextMove = new DefenderMove(this.game, {
      performer: player,
    });
  }

  get currentMove(): DefenderMove | AttackerMove {
    return this.moves.currentMove;
  }

  set currentMove(move: (DefenderMove | AttackerMove) & AfterHandler) {
    this.moves.currentMove = move;
  }

  get primalAttacker(): Player | never {
    return this.moves.firstDefenderMove.player.right;
  }

  get nextAttacker(): Player {
    return this.game.players.attacker === this.primalAttacker
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }
}
