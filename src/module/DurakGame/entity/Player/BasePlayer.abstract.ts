import type {
  AllowedMissingCardCount,
  PlayerKind,
} from "@durak-game/durak-dts";

import type LobbyUser from "../../../Lobbies/entity/LobbyUser.js";
import type Card from "../Card/index.js";
import type { Hand } from "../Deck/index.js";
import type { AllowedAttacker } from "./AllowedAttacker.js";
import type { AllowedDefender } from "./AllowedDefender.js";
import type { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import type { Attacker } from "./Attacker.js";
import type { Defender } from "./Defender.js";
import type { Player } from "./Player.js";
import type GamePlayerWebsocketService from "./Player.service.js";
import type { SuperPlayer } from "./SuperPlayer.abstract.js";

import { AllowedPlayerBadInputError } from "../../error/index.js";

export const GOOD_CARD_AMOUNT = 6;

export abstract class BasePlayer {
  static _Attacker: typeof Attacker;
  static _Defender: typeof Defender;
  static _Player: typeof Player;

  _left: BasePlayer;
  _right: BasePlayer;
  readonly hand: Hand;
  hasLeftTheGame = false;
  readonly info: LobbyUser;

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
    this._left = basePlayer._left;
    this._right = basePlayer._right;
    this.hand = basePlayer.hand;
    this.wsService = basePlayer.wsService;
    this.hasLeftTheGame = false;
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

  addSidePlayers(left: BasePlayer, right: BasePlayer) {
    this._left = left;
    this._right = right;
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

  becomeUpdated(player: BasePlayer) {
    player._left._right = this;
    player._right._left = this;
    this.addSidePlayers(player.left, player.right);
  }

  canTakeMore(cardCount: number) {
    return this.hand.count > cardCount;
  }

  emitKind() {
    this.wsService.emitOwnKind(this);
  }

  ensureCanTakeMore(cardCount: number) {
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

  exitGame() {
    this.hasLeftTheGame = true;
    // TODO add kind 'LeftGamePlayer'
    // ? so it means need to add new class LeftGamePlayer ?
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
      isInGame: this.hasLeftTheGame,
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

  // when isInGame === false then this might not work
  get enemies() {
    const value = [];
    let enemyPlayer = this._left;
    while (enemyPlayer !== this) {
      value.push(enemyPlayer.toEnemy());
      enemyPlayer = enemyPlayer._left;
    }
    return value;
  }

  get id() {
    return this.info.id;
  }

  // FIXME: add test
  get isAdmin() {
    return this.info.isAdmin;
  }

  get left() {
    let left = this._left;
    while (left.hasLeftTheGame) {
      left = left._left;
    }
    return left;
  }

  get missingNumberOfCards(): AllowedMissingCardCount {
    return Math.max(
      GOOD_CARD_AMOUNT - this.hand.count,
      0,
    ) as AllowedMissingCardCount;
  }

  get right() {
    let right = this._right;
    while (right.hasLeftTheGame) {
      right = right._right;
    }
    return right;
  }

  abstract get kind(): PlayerKind;
}
