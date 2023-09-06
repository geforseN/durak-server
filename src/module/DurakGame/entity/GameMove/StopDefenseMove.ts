import assert from "node:assert";
import type DurakGame from "../../DurakGame";
import { AllowedDefender } from "../Player/AllowedDefender";
import { FailedDefense } from "../DefenseEnding";
import GameMove, { type CanCommandNextMove } from "./GameMove.abstract";

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

  // TODO TODO TODO
  calculateNextThingToDoInGame() {
    if (this.game.desk.isDefended) {
      this.game.players = this.game.players
        .with(this.performer.asDisallowed())
        .with(this.game.round.primalAttacker.asAttacker().asAllowed(this.game));
      assert.ok(this.game.players.attacker.isAllowed());
      return this.game.players.attacker;
    }
    if (!this.game.desk.isAllowsMoves) {
      return new FailedDefense(this.game);
    }
    this.game.players = this.game.players
      .with(this.performer.asDisallowed().asSurrendered())
      .with(this.game.round.primalAttacker.asAttacker().asAllowed(this.game));
    assert.ok(this.game.players.attacker.isAllowed());
    return this.game.players.attacker;
  }
}
