import DurakGame from "../../DurakGame.js";
import Card from "../Card/index.js";
import DeskSlot from "../DeskSlot/index.js";
import {
  DefenderTransferMove,
  InsertDefendCardMove,
  StopDefenseMove,
} from "../GameMove/index.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { Defender } from "./Defender.js";
import { type SuperPlayer } from "./SuperPlayer.abstract.js";
import AllowedDefenderDefaultBehavior from "./DefaultBehavior/AllowedDefenderDefaultBehavior.js";
import { AllowedPlayerBadInputError } from "../../error/index.js";
import assert from "node:assert";

export class AllowedDefender extends AllowedSuperPlayer {
  defaultBehavior: AllowedDefenderDefaultBehavior;

  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer, game);
    this.defaultBehavior = new AllowedDefenderDefaultBehavior(this);
  }

  get kind() {
    return "AllowedDefender" as const;
  }

  asAllowedAgain(): AllowedDefender {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new AllowedDefender(this, this.game);
  }

  asAllowed(): AllowedDefender {
    return this.asAllowedAgain();
  }

  asDisallowed(): Defender {
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
    return new Defender(this);
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
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
    return new StopDefenseMove(this.game, this);
  }

  async ensureCanMakeTransferMove(card: Card, slot: DeskSlot): Promise<void> {
    if (!this.left.canTakeMore(this.game.desk.cardsCount)) {
      new AllowedPlayerBadInputError(
        "Player, to which you wanna transfer cards, has not enough card for defense. You must defend cards on desk",
        {
          header: "Transfer move attempt",
        },
      );
    }
    await slot.ensureCanBeAttacked();
    this.game.desk.ensureIncludesRank(card.rank);
    const deskRanks = [...this.game.desk.ranks];
    assert.ok(deskRanks.length === 1 && card.rank === deskRanks[0]);
    return this.game.desk.ensureAllowsTransferMove(card);
  }
}
