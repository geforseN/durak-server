import type StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import DefenderGaveUpMove from "@/module/DurakGame/entity/GameMove/DefenderGaveUpMove.js";
import {
  InsertDefendCardMove,
  StopDefenseMove,
} from "@/module/DurakGame/entity/GameMove/index.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import { Defender } from "@/module/DurakGame/entity/Player/Defender.js";
import { type SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

export class AllowedDefender {
  constructor(superPlayer: SuperPlayer, game: StartedDurakGame) {
    super(superPlayer, game);
  }

  asAllowed(): AllowedDefender {
    return this.asAllowedAgain();
  }

  asAllowedAgain(): AllowedDefender {
    return new AllowedDefender(this, this.game);
  }

  asDisallowed(): Defender {
    return new Defender(this);
  }

  ensureCanMakeTransferMove(card: Card): void {
    if (!this.left.canTakeMore(this.game.desk.cards.count + 1)) {
      throw new AllowedPlayerBadInputError(
        "Player, to which you wanna transfer cards, has not enough card for defense. You must defend cards on desk",
        {
          header: "Transfer move attempt",
        },
      );
    }
    this.game.desk.ensureOnlyHasRank(card.rank);
    this.game.desk.ensureAllowsTransferMove(card);
  }

  makeInsertMove(card: Card, slot: DeskSlot) {
    if (slot.isEmpty()) {
      this.ensureCanMakeTransferMove(card);
      return new DefenderTransferMove(this.game, this, { card, slot });
    }
    slot.ensureCanBeDefended(card);
    return new InsertDefendCardMove(this.game, this, {
      card,
      slot,
    });
  }

  makeStopMove() {
    if (!this.game.desk.isDefended()) {
      return new DefenderGaveUpMove(this.game, this);
    }
    return new StopDefenseMove(this.game, this);
  }

  get kind() {
    return "AllowedDefender" as const;
  }
}
