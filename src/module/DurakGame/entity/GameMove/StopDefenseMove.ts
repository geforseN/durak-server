import assert from "node:assert";
import type DurakGame from "../../DurakGame.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";
import { FailedDefense } from "../DefenseEnding/index.js";
import GameMove, { type CanCommandNextMove } from "./GameMove.abstract.js";

export default class StopDefenseMove
  extends GameMove<AllowedDefender>
  implements CanCommandNextMove
{
  constructor(game: DurakGame, performer: AllowedDefender) {
    super(game, performer);
  }

  override isInsertMove(): boolean {
    return false;
  }

  calculateNextThingToDoInGame() {
    if (this.game.desk.isDefended) {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(this.game.round.primalAttacker.asAttacker().asAllowed(this.game));
      assert.ok(this.game.players.attacker.isAllowed());
      return this.game.players.attacker;
    }
    if (!this.game.desk.isAllowsMoves) {
      return new FailedDefense(this.game);
    }
    this.game.players
      .mutateWith(this.performer.asDisallowed().asSurrendered())
      .mutateWith(this.game.round.primalAttacker.asAttacker().asAllowed(this.game));
    assert.ok(this.game.players.attacker.isAllowed());
    return this.game.players.attacker;
  }
}
