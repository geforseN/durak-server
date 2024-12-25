import DurakGame from "@/module/DurakGame/DurakGame.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import DefenderGaveUpMove from "@/module/DurakGame/entity/GameMove/DefenderGaveUpMove.js";
import {
  InsertDefendCardMove,
  StopDefenseMove,
} from "@/module/DurakGame/entity/GameMove/index.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import AllowedDefenderDefaultBehavior from "@/module/DurakGame/entity/Player/DefaultBehavior/AllowedDefenderDefaultBehavior.js";
import { Defender } from "@/module/DurakGame/entity/Player/Defender.js";
import { type SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

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
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
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
