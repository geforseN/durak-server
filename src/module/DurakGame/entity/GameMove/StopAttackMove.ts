import FailedDefense from "../DefenseEnding/FailedDefense.js";
import SuccessfulDefense from "../DefenseEnding/SuccessfulDefense.js";
import GameMove, { type CanCommandNextMove } from "./GameMove.abstract.js";
import type DurakGame from "../../DurakGame.js";
import { AllowedAttacker } from "../Player/AllowedAttacker.js";
import assert from "node:assert";
import { RoundEnd } from "../DefenseEnding/index.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";

export default class StopAttackMove
  extends GameMove<AllowedAttacker>
  implements CanCommandNextMove
{
  constructor(game: DurakGame, performer: AllowedAttacker) {
    super(game, performer);
  }

  calculateNextThingToDoInGame() {
    if (this.game.players.defender.isSurrendered()) {
      return this.#handleInPursuit();
    }
    // TODO
    // TODO
    // TODO
    // TODO add check if defender canNotTakeMore
    if (this.performer.didLatestMove) {
      this.game.players = this.game.players
        .with(this.performer.asDisallowed())
        .with(this.game.players.defender.asAllowed(this.game));
      assert.ok(this.game.players.defender.isAllowed());
      return this.game.players.defender;
    }
    if (this.game.players.defender.canWinDefense(this.game)) {
      return new SuccessfulDefense(this.game);
    }
    this.game.players = this.game.players
      .with(this.performer.asDisallowed())
      .with(this.game.round.nextAttacker.asAttacker().asAllowed(this.game));
    assert.ok(this.game.players.attacker.isAllowed());
    return this.game.players.attacker;
  }

  #handleInPursuit(): AllowedSuperPlayer | RoundEnd {
    if (
      // REVIEW - changed from Player to Player#id, ? should change again to Player ?
      // TODO use latestPrimalAttacker instead of primalAttacker
      this.performer.left.id === this.game.round.latestPrimalAttacker.id ||
      this.game.players.defender.left.id ===
        this.game.round.latestPrimalAttacker.id
    ) {
      return new FailedDefense(this.game);
    }

    this.game.players = this.game.players
      .with(this.performer.asDisallowed())
      .with(this.game.round.nextAttacker.asAttacker().asAllowed(this.game));
    assert.ok(this.game.players.attacker.isAllowed());
    return this.game.players.attacker;
  }
}
