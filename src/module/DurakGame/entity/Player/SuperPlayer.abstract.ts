import type DurakGame from "../../DurakGame.js";
import type { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { BasePlayer } from "./BasePlayer.abstract.js";

export abstract class SuperPlayer extends BasePlayer {
  constructor(basePlayer: BasePlayer) {
    super(basePlayer);
  }

  abstract asAllowed(game: DurakGame): AllowedSuperPlayer;
}
