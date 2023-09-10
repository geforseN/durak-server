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
import type GamePlayerWebsocketService from "./Player.service.js";

export const GOOD_CARD_AMOUNT = 6;

export abstract class BasePlayer {
  left: BasePlayer;
  right: BasePlayer;
  hand: Hand;
  info: PlayerInfo;
  wsService: GamePlayerWebsocketService;

  static _Player: typeof Player;
  static _Defender: typeof Defender;
  static _Attacker: typeof Attacker;

  static async configureDependencies() {
    await Promise.all([
      import("./Player.js").then(
        (value) => (BasePlayer._Player = value.Player),
      ),
      import("./Attacker.js").then(
        (value) => (BasePlayer._Attacker = value.Attacker),
      ),
      import("./Defender.js").then(
        (value) => (BasePlayer._Defender = value.Defender),
      ),
    ]);
  }

  constructor(basePlayer: BasePlayer);
  constructor(basePlayer: BasePlayer) {
    this.info = basePlayer.info;
    this.left = basePlayer.left;
    this.right = basePlayer.right;
    this.hand = basePlayer.hand;
    this.wsService = basePlayer.wsService;
    if (this.left) this.left.right = this;
    if (this.right) this.right.left = this;
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
    this.wsService.receiveCards({ player: this, cards });
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(
      GOOD_CARD_AMOUNT - this.hand.count,
      0,
    ) as AllowedMissingCardCount;
  }

  toDebugJSON() {
    return {
      id: this.id,
      info: this.info,
      kind: this.kind,
      isAllowedToMove: this.isAllowed(),
      hand: this.hand,
      leftId: this.left.id,
      rightId: this.right.id,
    };
  }

  toJSON() {
    return {
      id: this.id,
      info: this.info,
      kind: this.kind,
      isAllowedToMove: this.isAllowed(),
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
