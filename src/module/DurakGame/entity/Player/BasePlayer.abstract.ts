import type {
  AllowedMissingCardCount,
  PlayerKind,
} from "@durak-game/durak-dts";

import type Card from "../Card/index.js";
import type GamePlayerWebsocketService from "./Player.service.js";

import LobbyUser from "../../../Lobbies/entity/LobbyUser.js";
import { type Hand } from "../Deck/index.js";
import { type AllowedAttacker } from "./AllowedAttacker.js";
import { type AllowedDefender } from "./AllowedDefender.js";
import { type AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { type Attacker } from "./Attacker.js";
import { type Defender } from "./Defender.js";
import { type Player } from "./Player.js";
import { type SuperPlayer } from "./SuperPlayer.abstract.js";
import { AllowedPlayerBadInputError } from "../../error/index.js";

export const GOOD_CARD_AMOUNT = 6;

export abstract class BasePlayer {
  static _Attacker: typeof Attacker;
  static _Defender: typeof Defender;
  static _Player: typeof Player;

  readonly hand: Hand;
  readonly info: LobbyUser;
  left: BasePlayer;
  right: BasePlayer;

  // TODO think about it ...
  withEmit = {
    receiveCards: (...cards: Card[]) => {
      this.hand.receive(cards);
      this.wsService.receiveCards(cards, this);
    },
  };

  // TODO think about it ...
  withoutEmit = {
    receiveCards: (...cards: Card[]) => {
      this.hand.receive(cards);
    },
  };

  readonly wsService: GamePlayerWebsocketService;

  constructor(basePlayer: BasePlayer) {
    this.info = basePlayer.info;
    this.left = basePlayer.left;
    this.right = basePlayer.right;
    this.hand = basePlayer.hand;
    this.wsService = basePlayer.wsService;
  }

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

  asAttacker() {
    return new BasePlayer._Attacker(this);
  }

  asDefender() {
    return new BasePlayer._Defender(this);
  }

  asPlayer() {
    return new BasePlayer._Player(this);
  }

  canTakeMore(cardCount: number) {
    return this.hand.count > cardCount;
  }

  ensureCanAllowTransfer(cardCount: number) {
    if (this.left.canTakeMore(cardCount)) {
      return;
    }
    throw new AllowedPlayerBadInputError(
      "Player, to which you wanna transfer cards, has not enough card for defense. You must defend cards on desk",
      {
        header: "Transfer move attempt",
      },
    );
  }

  emitKind() {
    this.wsService.emitOwnKind(this);
  }

  isAllowed(): this is AllowedSuperPlayer {
    return false;
  }

  isAllowedAttacker(): this is AllowedAttacker {
    return this.isAttacker() && this.isAllowed();
  }

  isAllowedDefender(): this is AllowedDefender {
    return this.isDefender() && this.isAllowed();
  }

  isAttacker(): this is Attacker {
    return false;
  }

  isDefender(): this is Defender {
    return false;
  }

  isSuperPlayer(): this is SuperPlayer {
    return this.isAttacker() || this.isDefender();
  }

  receiveCards(...cards: Card[]): void {
    this.hand.receive(cards);
    this.wsService.receiveCards(cards, this);
  }

  toDebugJSON() {
    return {
      hand: this.hand,
      id: this.id,
      info: this.info,
      isAllowed: this.isAllowed(),
      kind: this.kind,
      leftId: this.left.id,
      rightId: this.right.id,
    };
  }

  toEnemy() {
    return {
      ...this.toJSON(),
      cardCount: this.hand.count,
    };
  }

  toJSON() {
    return {
      id: this.id,
      info: this.info,
      isAllowedToMove: this.isAllowed(),
      kind: this.kind,
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
    let player: BasePlayer = this;
    while ((player = player.left) !== this) {
      value.push(player.toEnemy());
    }
    return value;
  }

  get id() {
    return this.info.id;
  }

  get isAdmin() {
    return this.info.isAdmin;
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(
      GOOD_CARD_AMOUNT - this.hand.count,
      0,
    ) as AllowedMissingCardCount;
  }

  abstract get kind(): PlayerKind;
}
