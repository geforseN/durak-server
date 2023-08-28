import assert from "node:assert";
import DefenderMove from "./DefenderMove";
import DefaultBehavior from "../DefaultBehavior";
import getDefenseStrategy from "./getDefenseStrategy";

export class DefenderMoveDefaultBehavior extends DefaultBehavior<DefenderMove /* TODO specify move type*/> {
  value;

  constructor(move: DefenderMove, shouldBeCalled = true) {
    super(move, shouldBeCalled);
    this.value = setTimeout(
      this.#value.bind(this),
      this.move.game.settings.moveTime,
    );
  }

  async #value() {
    if (!this.shouldBeCalled) {
      return console.log("defaultBehavior DEFENDER: fast return");
    }
    assert.ok(this.move.player.isDefender());
    try {
      try {
        const card = await Promise.any(
          [...this.move.player.hand].map(async (card) => {
            assert.ok(this.move.player.isDefender());
            await this.move.player.canMakeTransferMove(
              this.move.game.round,
              card,
              this.move.game.desk.randomEmptySlotIndex,
            );
            return card;
          }),
        );
        assert.ok(card);
        await this.move.player.putCardOnDesk(
          this.move.game.round,
          card,
          this.move.game.desk.randomEmptySlotIndex,
        );
      } catch {
        const { defenseStrategy } = getDefenseStrategy(
          [...this.move.player.hand],
          this.move.game.desk.unbeatenSlots.cards,
        );
        const { defendCard, attackCard } = defenseStrategy[0];
        const slotIndex = [...this.move.game.desk].findIndex(
          (slot) =>
            slot.attackCard?.rank === attackCard.rank &&
            slot.attackCard.suit === attackCard.suit,
        );
        assert.ok(slotIndex >= 0);
        await this.move.player.putCardOnDesk(
          this.move.game.round,
          defendCard,
          slotIndex,
        );
      }
    } catch (error) {
      console.log("defaultBehavior DEFENDER: stopMove", error);
      return this.move.player.stopMove(this.move.game.round);
    }
  }
}
