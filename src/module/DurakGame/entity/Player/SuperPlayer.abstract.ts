import DurakGame from "../../DurakGame";
import { Hand } from "../Deck";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract";
import { BasePlayer } from "./BasePlayer.abstract";

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
