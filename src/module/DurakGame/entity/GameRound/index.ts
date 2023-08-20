import { Player } from "../Player";
import {
  AttackerMove,
  DefenderMove,
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";
import type DurakGame from "../../DurakGame";
import GameRoundMoves from "./GameRoundMoves";
import type FailedDefense from "../DefenseEnding/FailedDefense";
import type SuccessfulDefense from "../DefenseEnding/SuccessfulDefense";

export default class GameRound {
  readonly number: number;
  readonly moves: GameRoundMoves;
  readonly game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
    this.number = (game.round?.number || 0) + 1;
    this.moves = new GameRoundMoves();
    this.game.info.namespace.emit("round::new", {
      roundNumber: this.number,
    });
    this.giveAttackTo(game.players.attacker);
  }

  endWith(Defense: typeof FailedDefense | typeof SuccessfulDefense) {
    const newRound = new Defense(this.game).newGameRound;
    if (!newRound) {
      return this.game.end();
    }
    this.game.round = newRound;
  }

  giveAttackTo(player: Player) {
    this.moves.nextMove = new AttackerMove(this.game, {
      performer: player,
    });
  }

  giveDefendTo(player: Player) {
    this.moves.nextMove = new DefenderMove(this.game, {
      performer: player,
    });
  }

  get currentMove(): DefenderMove | AttackerMove {
    return this.moves.currentMove;
  }

  set currentMove(
    certainMove:
      | StopAttackMove
      | StopDefenseMove
      | InsertAttackCardMove
      | InsertDefendCardMove
      | TransferMove,
  ) {
    this.moves.currentMove = certainMove;
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
