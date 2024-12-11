import type DurakGame from "@/module/DurakGame/DurakGame.js";
import { AllowedAttacker } from "@/module/DurakGame/entity/Player/AllowedAttacker.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import { SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

export class Attacker extends SuperPlayer {
  get kind() {
    return "Attacker" as const;
  }

  asAllowed(game: DurakGame): AllowedSuperPlayer {
    return new AllowedAttacker(this, game);
  }

  isAttacker(): this is Attacker {
    return true;
  }
}
