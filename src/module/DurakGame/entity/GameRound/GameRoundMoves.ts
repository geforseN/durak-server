import assert from "node:assert";
import {
  BaseAttackerMove,
  BaseDefenderMove,
  DefenderTransferMove,
  GameMove,
} from "../GameMove";
import AllowedToMoveAttacker from "../Player/AllowedToMoveAttacker";
import AllowedToMoveDefender from "../Player/AllowedToMoveDefender";
import { Defender } from "../Player";

export default class GameRoundMoves {
  #value: GameMove<AllowedToMoveAttacker | AllowedToMoveDefender>[];

  constructor(
    value: GameMove<AllowedToMoveAttacker | AllowedToMoveDefender>[] = [],
  ) {
    this.#value = value;
  }

  get previousMove() {
    return this.#value[this.#currentMoveIndex - 1];
  }

  get currentMove() {
    return this.#value[this.#currentMoveIndex];
  }

  set currentMove(
    certainMove: GameMove<AllowedToMoveAttacker | AllowedToMoveDefender>,
  ) {
    this.currentMove.defaultBehavior.clearTimeout();
    this.#value[this.#currentMoveIndex] = certainMove;
    certainMove.emitContextToPlayers();
    if (certainMove.isNotBase()) {
      certainMove.handleAfterMoveIsDone();
    }
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

  get firstDefenderMove(): GameMove<AllowedToMoveDefender | Defender> | never {
    const firstDefenderMove = this.#value.find(
      (move): move is BaseDefenderMove =>
        move instanceof BaseDefenderMove &&
        !(move instanceof DefenderTransferMove),
    );
    assert.ok(firstDefenderMove, "Нет защищающегося хода");
    return firstDefenderMove;
  }
}
