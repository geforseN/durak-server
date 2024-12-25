import type { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";

import DefaultBehavior from "@/module/DurakGame/entity/Player/DefaultBehavior/DefaultBehavior.js";

export class AllowedDefenderDefaultBehavior extends DefaultBehavior<AllowedDefender> {
  constructor(
    allowedDefender: AllowedDefender,
    game = allowedDefender.game,
    shouldBeCalled = false,
  ) {
    super(allowedDefender, game, shouldBeCalled);
  }

  async makeMove() {
    return this.allowedPlayer.makeStopMove();
  }
}

export default AllowedDefenderDefaultBehavior;
