import type DurakGame from "../../DurakGame.js";
import { AllowedAttacker } from "./AllowedAttacker.js";
import type { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { SuperPlayer } from "./SuperPlayer.abstract.js";

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
