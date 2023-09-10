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

  setTimeout(delay = this.allowedPlayer.game.settings.moveTime) {
    // TODO make it work !
    new Promise((resolve) => setTimeout(resolve, delay))
      .then(() => this.callback())
      .then((nextMove) => {
        if (!nextMove) {
          // TODO
          // game should end or some mistake happened here
          return;
        }
        this.allowedPlayer.game.round.moves.push(nextMove);
        const nextThing = nextMove.calculateNextThingToDoInGame();
        if (nextThing.kind == "RoundEnd") {
        } else if (
          nextThing.kind === "Attacker" ||
          nextThing.kind === "Defender"
        ) {
          nextThing.kind;
        } else throw new Error("Never should be here");
      })
      .catch(() => {
        /* TODO */
      });
  }

  clearTimeout() {
    clearTimeout(this.timeout);
  }

  async callback() {
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
}

export default AllowedAttackerDefaultBehavior;
