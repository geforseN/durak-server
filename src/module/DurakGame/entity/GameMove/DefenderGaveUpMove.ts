import type DurakGame from "../../DurakGame.js";
import type { AllowedDefender } from "../Player/AllowedDefender.js";

import FailedDefense from "../DefenseEnding/FailedDefense.js";
import GameMove from "./GameMove.abstract.js";

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
