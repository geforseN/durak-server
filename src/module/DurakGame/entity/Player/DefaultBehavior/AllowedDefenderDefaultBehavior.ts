import assert from "node:assert";
import getDefenseStrategy from "./getDefenseStrategy.js";
import DefaultBehavior from "./DefaultBehavior.js";
import { AllowedDefender } from "../AllowedDefender.js";

export class AllowedDefenderDefaultBehavior extends DefaultBehavior<AllowedDefender> {
  constructor(
    allowedDefender: AllowedDefender,
    game = allowedDefender.game,
    shouldBeCalled = false,
  ) {
    super(allowedDefender, game, shouldBeCalled);
  }

  async calculateNextThingToDoInGame() {
    if (!this.shouldBeCalled) {
      return console.log("defaultBehavior DEFENDER: fast return");
    }
    // TODO should remove if code is not trash
    assert.ok(this.allowedPlayer.isAllowed());
    try {
      try {
        const card = await Promise.any(
          [...this.allowedPlayer.hand].map(async (card) => {
            const canMake = await this.allowedPlayer.canMakeTransferMove(
              card,
              this.game.desk.randomEmptySlot,
            );
            assert.ok(canMake);
            return card;
          }),
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
        const { defendCard, attackCard } = defenseStrategy[0];
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
