import assert from "node:assert";

import type { Card } from "../../index.js";
import type { AllowedDefender } from "../AllowedDefender.js";

import DefaultBehavior from "./DefaultBehavior.js";
import getDefenseStrategy from "./getDefenseStrategy.js";

export class AllowedDefenderDefaultBehavior extends DefaultBehavior<AllowedDefender> {
  constructor(
    allowedDefender: AllowedDefender,
    game = allowedDefender.game,
    shouldBeCalled = false,
  ) {
    super(allowedDefender, game, shouldBeCalled);
  }

  // @ts-ignore really weard place, should refacror
  async makeMove() {
    if (!this.shouldBeCalled) {
      return console.log("defaultBehavior DEFENDER: fast return");
    }
    // TODO should remove if code is not trash
    assert.ok(this.allowedPlayer.isAllowed());
    try {
      try {
        // @ts-ignore really weard place, should refacror
        const card = await Promise.any(
          [...this.allowedPlayer.hand].map<Promise<Card>>(
            async (card: Card) => {
              await this.allowedPlayer.ensureCanMakeTransferMove(card);
              return card;
            },
          ),
        );
        assert.ok(card);
        return await this.allowedPlayer.makeInsertMove(
          card,
          this.game.desk.randomEmptySlot,
        );
      } catch {
        const { defenseStrategy } = getDefenseStrategy(
          [...this.allowedPlayer.hand],
          this.game.desk.unbeatenSlots.cards,
        );
        const { attackCard, defendCard } = defenseStrategy[0];
        const slot = [...this.game.desk].find(
          (slot) =>
            slot.attackCard?.rank === attackCard.rank &&
            slot.attackCard.suit === attackCard.suit,
        );
        assert.ok(slot);
        return await this.allowedPlayer.makeInsertMove(defendCard, slot);
      }
    } catch (error) {
      console.log("defaultBehavior DEFENDER: stopMove", error);
      return this.allowedPlayer.makeStopMove();
    }
  }
}

export default AllowedDefenderDefaultBehavior;
