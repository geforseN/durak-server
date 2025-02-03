import type StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import type Player from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export abstract class SuperPlayer {
  constructor(readonly player: Player) {}

  abstract asAllowed(game: StartedDurakGame): AllowedSuperPlayer;
}
