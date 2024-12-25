import assert from "node:assert";

import type { Card } from "@/module/DurakGame/entity/index.js";
import type { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";

import DefaultBehavior from "@/module/DurakGame/entity/Player/DefaultBehavior/DefaultBehavior.js";
import getDefenseStrategy from "@/module/DurakGame/entity/Player/DefaultBehavior/getDefenseStrategy.js";

export class AllowedDefenderDefaultBehavior extends DefaultBehavior<AllowedDefender> {
  constructor(
    allowedDefender: AllowedDefender,
    game = allowedDefender.game,
    shouldBeCalled = false,
  ) {
    super(allowedDefender, game, shouldBeCalled);
  }

  makeMove() {
    if (!this.shouldBeCalled) {
      return console.log("defaultBehavior DEFENDER: fast return");
    }
    assert.ok(this.allowedPlayer.isAllowed());
    try {
      try {
        for (const card of this.allowedPlayer.hand._cards) {
          this.allowedPlayer.ensureCanMakeTransferMove(card);
        }
        // assert.ok(card);
        return this.allowedPlayer.makeInsertMove(
          card,
          this.game.desk.randomEmptySlot,
        );
      } catch {
        const { defenseStrategy } = getDefenseStrategy(
          [...this.allowedPlayer.hand],
          this.game.desk.unbeatenSlots.cards,
        );
        const { attackCard, defendCard } = defenseStrategy[0];
        const slot = [...this.game.desk].find((slot) =>
          slot.attackCard?.isEqualTo(attackCard),
        );
        assert.ok(slot);
        return this.allowedPlayer.makeInsertMove(defendCard, slot);
      }
    } catch (error) {
      console.log("defaultBehavior DEFENDER: stopMove", error);
      return this.allowedPlayer.makeStopMove();
    }
  }
}

export default AllowedDefenderDefaultBehavior;
