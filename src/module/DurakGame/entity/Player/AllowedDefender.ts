import assert from "node:assert";

import DurakGame from "../../DurakGame.js";
import { AllowedPlayerBadInputError } from "../../error/index.js";
import Card from "../Card/index.js";
import DeskSlot from "../DeskSlot/index.js";
import DefenderGaveUpMove from "../GameMove/DefenderGaveUpMove.js";
import {
  DefenderTransferMove,
  InsertDefendCardMove,
  StopDefenseMove,
} from "../GameMove/index.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import AllowedDefenderDefaultBehavior from "./DefaultBehavior/AllowedDefenderDefaultBehavior.js";
import { Defender } from "./Defender.js";
import { type SuperPlayer } from "./SuperPlayer.abstract.js";

export class AllowedDefender extends AllowedSuperPlayer {
  defaultBehavior: AllowedDefenderDefaultBehavior;

  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer, game);
    this.defaultBehavior = new AllowedDefenderDefaultBehavior(this);
  }

  asAllowed(): AllowedDefender {
    return this.asAllowedAgain();
  }

  asAllowedAgain(): AllowedDefender {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new AllowedDefender(this, this.game);
  }

  asDisallowed(): Defender {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new Defender(this);
  }

  async ensureCanMakeTransferMove(card: Card, slot: DeskSlot): Promise<void> {
    this.left.ensureCanAllowTransfer(this.game.desk.cardsCount + 1)
    await slot.ensureCanBeAttacked();
    this.game.desk.ensureIncludesRank(card.rank);
    const deskRanks = [...this.game.desk.ranks];
    assert.ok(deskRanks.length === 1 && card.rank === deskRanks[0]);
    return this.game.desk.ensureAllowsTransferMove(card);
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    slot.isEmpty() // THEN we can try transfer move
    if (this.game.round.isAllowsTransferMove) {
      try {
        await this.ensureCanMakeTransferMove(card, slot);
        return new DefenderTransferMove(this.game, this, { card, slot });
      } catch (error) {
        console.dir({ error, shit: "shit" });
        await slot.ensureCanBeDefended(card);
        return new InsertDefendCardMove(this.game, this, {
          card,
          slot,
        });
      }
    }
    await slot.ensureCanBeDefended(card);
    return new InsertDefendCardMove(this.game, this, {
      card,
      slot,
    });
  }

  makeStopMove() {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    if (!this.game.desk.isDefended) {
      // defender.defaultBehavior.shouldBeCalled = false;
      // defender.defaultBehavior.clearTimeout();

      return new DefenderGaveUpMove(this.game, this);
    }
    return new StopDefenseMove(this.game, this);
  }

  get kind() {
    return "AllowedDefender" as const;
  }
}
