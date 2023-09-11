import assert from "node:assert";
import {
  DefenderTransferMove,
  GameMove,
  InsertAttackCardMove,
} from "../GameMove/index.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";
import { raise } from "../../../../index.js";
import { InternalError } from "../../error/index.js";
import { AllowedAttacker } from "../Player/AllowedAttacker.js";

export default class GameRoundMoves {
  #value: GameMove<AllowedSuperPlayer>[];

  constructor(value: GameMove<AllowedSuperPlayer>[] = []) {
    this.#value = value;
  }

  push(move: GameMove<AllowedSuperPlayer>) {
    this.#value.push(move);
    if (move.isInsertMove()) {
      move.makeCardTransfer();
    }
  }

  get latestDoneMove() {
    return (
      this.#value.at(-1) ||
      raise(new InternalError("latestDoneMove was not found"))
    );
  }

  get #firstDefenderMove(): GameMove<AllowedDefender> | never {
    const firstDefenderMove = this.#value.find(
      (move): move is GameMove<AllowedDefender> =>
        move.performer.isDefender() && !(move instanceof DefenderTransferMove),
    );
    assert.ok(firstDefenderMove, "Нет защищающегося хода");
    return firstDefenderMove;
  }

  get primalMove(): GameMove<AllowedAttacker> {
    const firstDefenderMoveIndex = this.#value.indexOf(this.#firstDefenderMove);
    assert.ok(firstDefenderMoveIndex >= 1);
    const move = this.#value[firstDefenderMoveIndex - 1];
    assert.ok(move instanceof InsertAttackCardMove);
    return move;
  }
}
