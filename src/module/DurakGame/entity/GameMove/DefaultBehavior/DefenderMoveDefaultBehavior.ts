import assert from "node:assert";
import DefaultBehavior from "./DefaultBehavior";
import GameMove from "../GameMove.abstract";
import AllowedToMoveDefender from "../../Player/AllowedToMoveDefender";

export class DefenderMoveDefaultBehavior extends DefaultBehavior<AllowedToMoveDefender /* TODO specify move type*/> {
  callback;

  constructor(move: GameMove<AllowedToMoveDefender>, shouldBeCalled = true) {
    super(move, shouldBeCalled);
    this.callback = this.#value.bind(this);
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
