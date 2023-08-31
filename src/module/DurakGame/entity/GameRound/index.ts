import type DurakGame from "../../DurakGame";
import type FailedDefense from "../DefenseEnding/FailedDefense";
import type SuccessfulDefense from "../DefenseEnding/SuccessfulDefense";
import {
  BaseAttackerMove,
  BaseDefenderMove,
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  DefenderTransferMove,
} from "../GameMove";
import type { Player } from "../Player";
import GameRoundMoves from "./GameRoundMoves";

export default class GameRound {
  readonly number: number;
  readonly moves: GameRoundMoves;
  readonly game: DurakGame;

  constructor(game: DurakGame, moves = new GameRoundMoves()) {
    this.game = game;
    this.number = (game.round?.number || 0) + 1;
    this.moves = moves;
    this.game.info.namespace.emit("round::new", {
      roundNumber: this.number,
    });
    this.letPushMoveToAllowedPlayer();
  }

  endWith(Defense: typeof FailedDefense | typeof SuccessfulDefense) {
    const newRound = new Defense(this.game).newGameRound;
    if (!newRound) {
      return this.game.end();
    }
    this.game.round = newRound;
  }

  giveAttackTo(player: Player) {
    this.moves.nextMove = new BaseAttackerMove(this.game, {
      performer: player,
    });
    return this;
  }

  giveDefendTo(player: Player) {
    this.moves.nextMove = new BaseDefenderMove(this.game, {
      performer: player,
    });
    return this;
  }

  letPushMoveToAllowedPlayer() {
    this.moves.nextMove = this.game.players.allowedToMovePlayer.makeBaseMove();
  }

  get currentMove(): BaseDefenderMove | BaseAttackerMove {
    return this.moves.currentMove;
  }

  set currentMove(
    certainMove:
      | StopAttackMove
      | StopDefenseMove
      | InsertAttackCardMove
      | InsertDefendCardMove
      | DefenderTransferMove,
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
