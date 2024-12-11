import assert from "node:assert";

import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import type { SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import { InsertAttackCardMove, StopAttackMove } from "@/module/DurakGame/entity/GameMove/index.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import { Attacker } from "@/module/DurakGame/entity/Player/Attacker.js";
import AllowedAttackerDefaultBehavior from "@/module/DurakGame/entity/Player/DefaultBehavior/AllowedAttackerDefaultBehavior.js";

export class AllowedAttacker extends AllowedSuperPlayer {
  defaultBehavior: AllowedAttackerDefaultBehavior;

  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer, game);
    this.defaultBehavior = new AllowedAttackerDefaultBehavior(this);
  }

  asAllowed(): AllowedAttacker {
    return this.asAllowedAgain();
  }

  asAllowedAgain(): AllowedAttacker {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new AllowedAttacker(this, this.game);
  }

  asDisallowed(): Attacker {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new Attacker(this);
  }

  hasBeenPrimalAttacker() {
    try {
      return this.game.round.primalAttacker.id === this.id;
    } catch (error) {
      return false;
    }
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
    if (!this.game.desk.isEmpty) {
      await slot.ensureCanBeAttacked();
      this.game.desk.ensureIncludesRank(card.rank);
    }
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new InsertAttackCardMove(this.game, this, {
      card,
      slot,
    });
  }

  makeStopMove() {
    assert.ok(
      !this.game.desk.isEmpty,
      new AllowedPlayerBadInputError("Нельзя закончить раунд с пустым столом", {
        header: "Stop move attempt",
      }),
    );
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new StopAttackMove(this.game, this);
  }

  get didPreviousMoveAsInsert(): boolean {
    return (
      this.game.round.moves.previous.isInsertMove() &&
      this.game.round.moves.previous.performer.asLatest() === this
    );
  }

  get kind() {
    return "AllowedAttacker" as const;
  }
}
