import assert from "node:assert";
import {
  BaseAttackerMove,
  DefenderGaveUpMove,
  BaseDefenderMove,
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  DefenderTransferMove,
} from "../GameMove";

export default class GameRoundMoves {
  #value: (BaseDefenderMove | BaseAttackerMove)[];

  constructor(value = []) {
    this.#value = value;
  }

  get previousMove(): BaseDefenderMove | BaseAttackerMove {
    return this.#value[this.#currentMoveIndex - 1];
  }

  get currentMove(): BaseDefenderMove | BaseAttackerMove {
    return this.#value[this.#currentMoveIndex];
  }

  set currentMove(
    certainMove:
      | StopAttackMove
      | StopDefenseMove
      | InsertAttackCardMove
      | InsertDefendCardMove
      | DefenderTransferMove,
  ) {
    this.currentMove.defaultBehavior.clearTimeout();
    this.#value[this.#currentMoveIndex] = certainMove;
    certainMove.emitContextToPlayers();
    certainMove.handleAfterMoveIsDone();
  }

  get #currentMoveIndex(): number {
    return this.#value.length - 1;
  }

  set nextMove(baseMove: BaseDefenderMove | BaseAttackerMove) {
    this.currentMove?.defaultBehavior.clearTimeout();
    this.#value.push(baseMove);
    baseMove.defaultBehavior.setTimeout();
    baseMove.emitContextToPlayers();
  }

  get firstDefenderMove(): BaseDefenderMove | never {
    const firstDefenderMove = this.#value.find(
      (move): move is BaseDefenderMove =>
        move instanceof BaseDefenderMove && !(move instanceof DefenderTransferMove),
    );
    assert.ok(firstDefenderMove, "Нет защищающегося хода");
    return firstDefenderMove;
  }
}
