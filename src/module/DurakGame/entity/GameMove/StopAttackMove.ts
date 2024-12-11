import type DurakGame from "@/module/DurakGame/DurakGame.js";

import FailedDefense from "@/module/DurakGame/entity/DefenseEnding/FailedDefense.js";
import SuccessfulDefense from "@/module/DurakGame/entity/DefenseEnding/SuccessfulDefense.js";
import { type AllowedAttacker } from "@/module/DurakGame/entity/Player/AllowedAttacker.js";
import GameMove from "@/module/DurakGame/entity/GameMove/GameMove.abstract.js";

export default class StopAttackMove extends GameMove<AllowedAttacker> {
  constructor(game: DurakGame, performer: AllowedAttacker) {
    super(game, performer);
  }

  #handleInPursuit() {
    if (
      // REVIEW - changed from Player to Player#id, ? should change again to Player ?
      this.performer.left.id === this.game.round.primalAttackerAsLatest.id ||
      this.game.players.defender.left.id === this.game.round.primalAttackerAsLatest.id
    ) {
      return () => new FailedDefense(this.game);
    }
    return this.strategies.letNextPossibleAttackerMove;
  }

  get gameMutationStrategy() {
    if (this.game.round.moves.isDefenderSurrendered) {
      return this.#handleInPursuit();
    }
    // TODO
    // TODO
    // TODO
    // TODO add check if defender canNotTakeMore
    if (this.performer.didPreviousMoveAsInsert) {
      return this.strategies.letDefenderMove;
    }
    if (this.game.players.defender.canWinDefense(this.game)) {
      return () => new SuccessfulDefense(this.game);
    }
    return this.strategies.letNextPossibleAttackerMove;
  }
}
