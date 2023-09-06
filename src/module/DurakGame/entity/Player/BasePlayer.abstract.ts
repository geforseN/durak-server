import {
  AllowedMissingCardCount,
  PlayerInfo,
  PlayerKind,
} from "@durak-game/durak-dts";
import Card from "../Card";
import { Hand } from "../Deck";
import { type AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract";
import { Attacker } from "./Attacker";
import { Defender } from "./Defender";
import { type SuperPlayer } from "./SuperPlayer.abstract";
import { Player } from "./Player";

export const GOOD_CARD_AMOUNT = 6;

export abstract class BasePlayer {
  abstract left: BasePlayer;
  abstract right: BasePlayer;
  abstract hand: Hand;
  private info: PlayerInfo;

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
    return new Attacker(this);
  }

  asDefender() {
    return new Defender(this);
  }

  asPlayer() {
    // return import("./Player.js").then(() => new Player(this));
    return new Player(this);
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
}
