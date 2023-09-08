import DurakGame from "../../DurakGame.js";
import { Hand } from "../Deck/index.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { BasePlayer } from "./BasePlayer.abstract.js";

export abstract class SuperPlayer extends BasePlayer {
  declare left: BasePlayer;
  declare right: BasePlayer;
  declare hand: Hand;

  constructor(basePlayer: BasePlayer) {
    super(basePlayer);
    this.left = basePlayer.left;
    this.right = basePlayer.right;
    this.hand = basePlayer.hand;
  }

  abstract asAllowed(game: DurakGame): AllowedSuperPlayer;
}
