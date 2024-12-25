import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";

import FailedDefense from "@/module/DurakGame/entity/DefenseEnding/FailedDefense.js";
import GameMove from "@/module/DurakGame/entity/GameMove/GameMove.abstract.js";
import type InsertGameMove from "@/module/DurakGame/entity/GameMove/InsertGameMove.abstract.js";

export default class StopDefenseMove extends GameMove<AllowedDefender> {
  constructor(game: DurakGame, performer: AllowedDefender) {
    super(game, performer);
  }

  override isInsertMove(): this is InsertGameMove<AllowedDefender> {
    return false;
  }

  get gameMutationStrategy() {
    if (this.game.desk.isDefended) {
      return this.strategies.letPrimalAttackerMove;
    }
    if (!this.game.desk.isAllowsMoves) {
      return () => new FailedDefense(this.game);
    }
    return this.strategies.letPrimalAttackerMove;
  }
}
