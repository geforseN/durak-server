import { Hand } from "../Deck/index.js";
import { BasePlayer } from "./BasePlayer.abstract.js";

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
