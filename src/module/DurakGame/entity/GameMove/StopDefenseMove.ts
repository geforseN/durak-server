import type DurakGame from "../../DurakGame.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";
import { FailedDefense } from "../DefenseEnding/index.js";
import GameMove from "./GameMove.abstract.js";

export default class StopDefenseMove extends GameMove<AllowedDefender> {
  constructor(game: DurakGame, performer: AllowedDefender) {
    super(game, performer);
  }

  override isInsertMove(): boolean {
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
