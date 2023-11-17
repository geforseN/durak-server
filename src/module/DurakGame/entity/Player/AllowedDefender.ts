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

  async ensureCanMakeTransferMove(card: Card): Promise<void> {
    this.left.ensureCanTakeMore(this.game.desk.cardsCount + 1);
    this.game.desk.ensureOnlyHasRank(card.rank);
    this.game.desk.ensureAllowsTransferMove(card);
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
    if (slot.isEmpty()) {
      await this.ensureCanMakeTransferMove(card);
      this.defaultBehavior.shouldBeCalled = false;
      this.defaultBehavior.clearTimeout();
      return new DefenderTransferMove(this.game, this, { card, slot });
    }
    await slot.ensureCanBeDefended(card);
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new InsertDefendCardMove(this.game, this, {
      card,
      slot,
    });
  }

  makeStopMove() {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    if (!this.game.desk.isDefended) {
      return new DefenderGaveUpMove(this.game, this);
    }
    return new StopDefenseMove(this.game, this);
  }

  get kind() {
    return "AllowedDefender" as const;
  }
}
