import assert from "node:assert";

import { InternalError } from "@/module/DurakGame/error/index.js";
import DefenderGaveUpMove from "@/module/DurakGame/entity/GameMove/DefenderGaveUpMove.js";
import { GameMove } from "@/module/DurakGame/entity/GameMove/index.js";
import { AllowedAttacker } from "@/module/DurakGame/entity/Player/AllowedAttacker.js";
import { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";

export default class GameRoundMoves {
  #value: GameMove<AllowedSuperPlayer>[];

  constructor(value: GameMove<AllowedSuperPlayer>[] = []) {
    this.#value = value;
  }

  push(move: GameMove<AllowedSuperPlayer>) {
    this.#value.push(move);
    move.emitContextToPlayers();
  }

  get firstRealDefenderMove(): GameMove<AllowedDefender> | never {
    const firstRealDefenderMove = this.#value.find(
      (move): move is GameMove<AllowedDefender> =>
        move.isDoneByDefender() && !move.isTransferMove(),
    );
    assert.ok(firstRealDefenderMove, "Нет защищающегося хода");
    return firstRealDefenderMove;
  }

  get isDefenderSurrendered() {
    return this.#value.some((move) => move instanceof DefenderGaveUpMove);
  }

  get latest() {
    assert.ok(
      this.#value.length,
      new InternalError("No one yet done a single move in current round"),
    );
    return this.#value[this.#value.length - 1];
  }

  get previous() {
    assert.ok(
      this.#value.length >= 1,
      new InternalError("No one yet done a single move"),
    );
    return this.#value[this.#value.length - 2];
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
