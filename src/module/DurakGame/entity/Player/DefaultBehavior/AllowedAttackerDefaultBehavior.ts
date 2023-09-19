import assert from "node:assert";

import type { AllowedAttacker } from "../AllowedAttacker.js";

import DefaultBehavior from "./DefaultBehavior.js";

export class AllowedAttackerDefaultBehavior extends DefaultBehavior<AllowedAttacker> {
  constructor(
    allowedAttacker: AllowedAttacker,
    game = allowedAttacker.game,
    shouldBeCalled = true,
  ) {
    super(allowedAttacker, game, shouldBeCalled);
  }

  async #putCardWithDeskRank() {
    for (const rank of this.allowedPlayer.game.desk.ranks) {
      const card = this.allowedPlayer.hand.get((card) =>
        card.hasSame({ rank }),
      );
      if (!card) continue;
      const { randomEmptySlot } = this.allowedPlayer.game.desk;
      console.log(
        "defaultBehavior ATTACKER: putCardIfPossible " +
          card +
          randomEmptySlot.index,
      );
      return await this.allowedPlayer.makeInsertMove(card, randomEmptySlot);
    }
    throw new Error("Impossible to put card, should stop move");
  }

  async #putRandomCard() {
    const { randomCard } = this.allowedPlayer.superHand;
    const { randomEmptySlot } = this.allowedPlayer.game.desk;
    console.log(
      "defaultBehavior ATTACKER: insertRandomCard " +
        randomCard +
        randomEmptySlot.index,
    );
    return await this.allowedPlayer.makeInsertMove(randomCard, randomEmptySlot);
  }

  clearTimeout() {
    clearTimeout(this.timeout);
  }

  async makeMove() {
    if (!this.shouldBeCalled) {
      return console.log("defaultBehavior ATTACKER: fast return");
    }
    assert.ok(this.allowedPlayer.isAllowed());
    if (this.allowedPlayer.game.desk.isEmpty) {
      return await this.#putRandomCard();
    }
    try {
      return await this.#putCardWithDeskRank();
    } catch {
      return this.allowedPlayer.makeStopMove();
    }
  }
}

export default AllowedAttackerDefaultBehavior;
