import type {
  AllowedMissingCardCount,
  PlayerInfo,
  PlayerKind,
} from "@durak-game/durak-dts";
import type Card from "../Card/index.js";
import { type Hand } from "../Deck/index.js";
import { type AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { type Attacker } from "./Attacker.js";
import { type Player } from "./Player.js";
import { type Defender } from "./Defender.js";
import { type SuperPlayer } from "./SuperPlayer.abstract.js";

export const GOOD_CARD_AMOUNT = 6;

export abstract class BasePlayer {
  abstract left: BasePlayer;
  abstract right: BasePlayer;
  abstract hand: Hand;
  private info: PlayerInfo;

  static _Player: typeof Player;
  static _Defender: typeof Defender;
  static _Attacker: typeof Attacker;

  constructor(basePlayer: BasePlayer);
  constructor(basePlayer: BasePlayer) {
    this.info = basePlayer.info;
  }

  get id() {
    return this.info.id;
  }

  get isAdmin() {
    return this.info.isAdmin;
  }

  abstract get kind(): PlayerKind;

  asAttacker() {
    return new BasePlayer._Attacker(this);
  }

  asDefender() {
    return new BasePlayer._Defender(this);
  }

  asPlayer() {
    return new BasePlayer._Player(this);
  }

  isDefender(): this is Defender {
    return false;
  }

  isAttacker(): this is Attacker {
    return false;
  }

  isSuperPlayer(): this is SuperPlayer {
    return this.isAttacker() || this.isDefender();
  }

  isAllowed(): this is AllowedSuperPlayer {
    return false;
  }

  canTakeMore(cardCount: number) {
    return this.hand.count > cardCount;
  }

  receiveCards(...cards: Card[]): void {
    this.hand.receive(...cards);
    this.wsService?.receiveCards({ player: this, cards });
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(
      GOOD_CARD_AMOUNT - this.hand.count,
      0,
    ) as AllowedMissingCardCount;
  }

  toJSON() {
    return {
      id: this.id,
      info: this.info,
      kind: this.kind,
    };
  }

  toEnemy() {
    return {
      ...this.toJSON(),
      cardCount: this.hand.count,
    };
  }

  toSelf() {
    return {
      ...this.toJSON(),
      cards: [...this.hand].map((card) => card.toJSON()),
    };
  }

  get enemies() {
    const value = [];
    let enemy = this.left;
    while (enemy.id !== this.id) {
      value.push(enemy.toEnemy());
      enemy = enemy.left;
    }
    return value;
  }
}
