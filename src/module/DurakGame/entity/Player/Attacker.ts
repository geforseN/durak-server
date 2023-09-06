import DurakGame from "../../DurakGame";
import { AllowedAttacker } from "./AllowedAttacker";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract";
import { SuperPlayer } from "./SuperPlayer.abstract";

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
