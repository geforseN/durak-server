import assert from "node:assert";

import type StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import type { SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

import { AllowedPlayerBadInputError } from "@/module/DurakGame/error/index.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import { Attacker } from "@/module/DurakGame/entity/Player/Attacker.js";

export class AllowedAttacker extends AllowedSuperPlayer {
  constructor(superPlayer: SuperPlayer, game: StartedDurakGame) {
    super(superPlayer, game);
  }

  asAllowed(): AllowedAttacker {
    return this.asAllowedAgain();
  }

  asAllowedAgain(): AllowedAttacker {
    return new AllowedAttacker(this, this.game);
  }

  asDisallowed(): Attacker {
    return new Attacker(this);
  }

  makeInsertMove(card: Card, slot: DeskSlot) {
    if (!this.game.desk.isEmpty()) {
      slot.ensureCanBeAttacked();
      this.game.desk.ensureIncludesRank(card.rank);
    }
    return new InsertAttackCardMove(this.game, this, {
      card,
      slot,
    });
  }

  makeStopMove() {
    assert.ok(
      !this.game.desk.isEmpty(),
      new AllowedPlayerBadInputError("Нельзя закончить раунд с пустым столом", {
        header: "Stop move attempt",
      }),
    );
    return new StopAttackMove(this.game, this);
  }

  get kind() {
    return "AllowedAttacker" as const;
  }
}
