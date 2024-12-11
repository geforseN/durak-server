import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";

import FailedDefense from "@/module/DurakGame/entity/DefenseEnding/FailedDefense.js";
import GameMove from "@/module/DurakGame/entity/GameMove/GameMove.abstract.js";

export default class DefenderGaveUpMove extends GameMove<AllowedDefender> {
  constructor(game: DurakGame, surrenderedDefender: AllowedDefender) {
    super(game, surrenderedDefender);
  }

  get gameMutationStrategy() {
    if (this.game.desk.isAllowsMoves) {
      return this.strategies.letPrimalAttackerMove;
    }
    return () => new FailedDefense(this.game);
  }
}
