import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export abstract class SuperPlayer extends BasePlayer {
  constructor(basePlayer: BasePlayer) {
    super(basePlayer);
  }

  abstract asAllowed(game: DurakGame): AllowedSuperPlayer;
}
