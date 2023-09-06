import { Hand } from "../Deck";
import { BasePlayer } from "./BasePlayer.abstract";

export class Player extends BasePlayer {
  declare left: BasePlayer;
  declare right: BasePlayer;
  declare hand: Hand;

  constructor(basePlayer: BasePlayer) {
    super(basePlayer);
    this.left = basePlayer.left;
    this.right = basePlayer.right;
    this.hand = basePlayer.hand;
  }

  get kind() {
    return "Player" as const;
  }
}
