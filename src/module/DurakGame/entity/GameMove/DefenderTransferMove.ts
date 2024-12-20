import assert from "node:assert";

import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";

import Card from "@/module/DurakGame/entity/Card/index.js";
import { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";
import InsertGameMove from "@/module/DurakGame/entity/GameMove/InsertGameMove.abstract.js";

export default class TransferMove extends InsertGameMove<AllowedDefender> {
  constructor(
    game: DurakGame,
    performer: AllowedDefender,
    context: {
      card: Card;
      slot: DeskSlot;
    },
  ) {
    super(game, performer, context);
  }

  override isTransferMove() {
    return true;
  }

  //  NOTE: When transferring an attack, more than one card
  // of the original rank can be added to the attack.
  // So in next move performed can
  // - put another card (but kind of player will be 'AllowedAttacker', not 'AllowedDefender')
  // - simply make stop attack move
  get gameMutationStrategy() {
    return () => {
      assert.ok(
        this.performer.right.isAttacker() && !this.performer.right.isAllowed(),
      );
      this.game.players
        .mutateWith(this.performer.right.asPlayer())
        .mutateWith(this.performer.left.asDefender())
        .mutateWith(this.performer.asAttacker().asAllowed(this.game));
      assert.ok(
        this.performer.asLatest().isAttacker() &&
          this.performer.asLatest().isAllowed(),
      );
      // return this.performer.asLatest();
    };
  }
}
