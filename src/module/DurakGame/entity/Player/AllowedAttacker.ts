import type { CardDTO } from "@durak-game/durak-dts";

import assert from "node:assert";

import type { GameMove } from "../GameMove/index.js";
import type { SuperPlayer } from "./SuperPlayer.abstract.js";

import DurakGame from "../../DurakGame.js";
import { AllowedPlayerBadInputError } from "../../error/index.js";
import Card from "../Card/index.js";
import DeskSlot from "../DeskSlot/index.js";
import { InsertAttackCardMove, StopAttackMove } from "../GameMove/index.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { Attacker } from "./Attacker.js";
import AllowedAttackerDefaultBehavior from "./DefaultBehavior/AllowedAttackerDefaultBehavior.js";

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
