import assert from "node:assert";
import { GameMove } from "../GameMove/index.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";
import { InternalError } from "../../error/index.js";
import { AllowedAttacker } from "../Player/AllowedAttacker.js";

export default class GameRoundMoves {
  #value: GameMove<AllowedSuperPlayer>[];

  constructor(value: GameMove<AllowedSuperPlayer>[] = []) {
    this.#value = value;
  }

  push(move: GameMove<AllowedSuperPlayer>) {
    this.#value.push(move);
    move.emitContextToPlayers();
  }

  get latestDoneMove() {
    assert.ok(
      this.#value.length,
      new InternalError("No one yet done a single move"),
    );
    return this.#value[this.#value.length - 1];
  }

  get firstRealDefenderMove(): GameMove<AllowedDefender> | never {
    const firstRealDefenderMove = this.#value.find(
      (move): move is GameMove<AllowedDefender> =>
        move.isDoneByDefender() && !move.isTransferMove(),
    );
    assert.ok(firstRealDefenderMove, "Нет защищающегося хода");
    return firstRealDefenderMove;
  }

  get primalMove(): GameMove<AllowedAttacker> {
    const firstDefenderMoveIndex = this.#value.indexOf(
      this.firstRealDefenderMove,
    );
    assert.ok(firstDefenderMoveIndex >= 1);
    const move = this.#value[firstDefenderMoveIndex - 1];
    assert.ok(move.isDoneByAttacker());
    return move;
  }
}
