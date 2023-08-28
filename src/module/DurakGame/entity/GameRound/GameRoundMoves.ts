import assert from "node:assert";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  TransferMove,
} from "../GameMove";

export default class GameRoundMoves {
  #value: (DefenderMove | AttackerMove)[];

  constructor(value = []) {
    this.#value = value;
  }

  get previousMove(): DefenderMove | AttackerMove {
    return this.#value[this.#currentMoveIndex - 1];
  }

  get currentMove(): DefenderMove | AttackerMove {
    return this.#value[this.#currentMoveIndex];
  }

  set currentMove(
    certainMove:
      | StopAttackMove
      | StopDefenseMove
      | InsertAttackCardMove
      | InsertDefendCardMove
      | TransferMove,
  ) {
    this.currentMove.defaultBehavior.stop();
    this.#value[this.#currentMoveIndex] = certainMove;
    certainMove.emitContextToPlayers();
    certainMove.handleAfterMoveIsDone();
  }

  get #currentMoveIndex(): number {
    return this.#value.length - 1;
  }

  set nextMove(uncertainMove: DefenderMove | AttackerMove) {
    this.currentMove?.defaultBehavior.stop();
    this.#value.push(uncertainMove);
    uncertainMove.emitContextToPlayers();
  }

  get firstDefenderMove(): DefenderMove | never {
    const firstDefenderMove = this.#value.find(
      (move): move is DefenderMove =>
        move instanceof DefenderMove && !(move instanceof TransferMove),
    );
    assert.ok(firstDefenderMove, "Нет защищающегося хода");
    return firstDefenderMove;
  }
}
