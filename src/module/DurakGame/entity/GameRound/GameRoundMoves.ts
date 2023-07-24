import assert from "node:assert";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
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

  set currentMove(move: DefenderMove | AttackerMove) {
    this.currentMove.defaultBehaviour.stop();
    this.#value[this.#currentMoveIndex] = move;
    move.emitOwnData();
    assert.ok(
      "handleAfterMoveIsDone" in move &&
        typeof move.handleAfterMoveIsDone === "function",
      "TypeScript",
    );
    move.handleAfterMoveIsDone();
  }

  get #currentMoveIndex(): number {
    return this.#value.length - 1;
  }

  get isDefenderGaveUp() {
    return !!this.#value.findLast((move) => move instanceof DefenderGaveUpMove);
  }

  set nextMove(uncertainMove: DefenderMove | AttackerMove) {
    clearTimeout_____(this.currentMove?.defaultBehavior);
    this.#value.push(uncertainMove);
    uncertainMove.emitAllowedPlayerData();
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
