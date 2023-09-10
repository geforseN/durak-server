import type { Hand } from "../Deck/index.js";
import type NonStartedGameUser from "./NonStartedGameUser.js";
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

  static create(user: NonStartedGameUser): [number, Player, number] {
    return [
      user.leftPlayerIndex,
      new Player({
        hand: user.hand,
        wsService: user.wsService,
        left: undefined,
        right: undefined,
        info: user.info,
      }),
      user.rightPlayerIndex,
    ];
  }
}
