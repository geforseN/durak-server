import FailedDefense from "../DefenseEnding/FailedDefense.js";
import SuccessfulDefense from "../DefenseEnding/SuccessfulDefense.js";
import type DurakGame from "../../DurakGame.js";
import { type AllowedAttacker } from "../Player/AllowedAttacker.js";
import GameMove from "./GameMove.abstract.js";

export default class StopAttackMove extends GameMove<AllowedAttacker> {
  constructor(game: DurakGame, performer: AllowedAttacker) {
    super(game, performer);
  }

  get gameMutationStrategy() {
    if (this.game.players.defender.isSurrendered()) {
      return this.#handleInPursuit();
    }
    // TODO
    // TODO
    // TODO
    // TODO add check if defender canNotTakeMore
    if (this.performer.didLatestMove) {
      return this.strategies.letDefenderMove;
    }
    if (this.game.players.defender.canWinDefense(this.game)) {
      return () => new SuccessfulDefense(this.game);
    }
    return this.strategies.letNextPossibleAttackerMove;
  }

  #handleInPursuit() {
    if (
      // REVIEW - changed from Player to Player#id, ? should change again to Player ?
      // TODO use latestPrimalAttacker instead of primalAttacker
      this.performer.left.id === this.game.round.latestPrimalAttacker.id ||
      this.game.players.defender.left.id ===
        this.game.round.latestPrimalAttacker.id
    ) {
      return () => new FailedDefense(this.game);
    }
    return this.strategies.letNextPossibleAttackerMove;
  }
}
