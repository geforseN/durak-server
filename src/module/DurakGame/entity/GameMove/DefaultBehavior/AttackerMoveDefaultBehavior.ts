import assert from "node:assert";
import DefaultBehavior from "./DefaultBehavior";
import GameMove from "../GameMove.abstract";
import AllowedToMoveAttacker from "../../Player/AllowedToMoveAttacker";

export class AttackerMoveDefaultBehavior extends DefaultBehavior<AllowedToMoveAttacker /* TODO specify move type*/> {
  callback: () => Promise<void>;

  constructor(move: GameMove<AllowedToMoveAttacker>, shouldBeCalled = true) {
    super(move, shouldBeCalled);
    this.callback = this.#value.bind(this);
  }

  async #value() {
    if (!this.shouldBeCalled) {
      return console.log("defaultBehavior ATTACKER: fast return");
    }
    if (this.move.game.desk.isEmpty) {
      return await this.#putRandomCard();
    }
    try {
      await this.#putCardWithDeskRank();
    } catch {
      assert.ok(this.move.player.isAttacker());
      this.move.player.stopMove(this.move.game.round);
    }
  }

  async #putRandomCard() {
    assert.ok(this.move.player.isAttacker());
    const randomCard = this.move.player.randomCard;
    console.log("defaultBehavior ATTACKER: insertRandomCard " + randomCard);
    return await this.move.player.putCardOnDesk(
      this.move.game.round,
      randomCard,
      this.move.game.desk.randomEmptySlotIndex,
    );
  }

  async #putCardWithDeskRank() {
    assert.ok(this.move.player.isAttacker());
    for (const rank of this.move.game.desk.ranks) {
      const card = this.move.player.hand.get((card) => card.hasSame({ rank }));
      if (!card) continue;
      console.log("defaultBehavior ATTACKER: putCardIfPossible " + card);
      return await this.move.player.putCardOnDesk(
        this.move.game.round,
        card,
        this.move.game.desk.randomEmptySlotIndex,
      );
    }
    throw new Error("Impossible to put card, should stop move");
  }
}
