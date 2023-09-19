import type { Card as CardDTO } from "@durak-game/durak-dts";

import assert from "node:assert";

import type DurakGame from "../../DurakGame.js";
import type Card from "../Card/index.js";
import type DeskSlot from "../DeskSlot/index.js";
import type GameMove from "../GameMove/GameMove.abstract.js";
import type { Attacker } from "./Attacker.js";
import type DefaultBehavior from "./DefaultBehavior/DefaultBehavior.js";
import type { Defender } from "./Defender.js";

import SuperHand from "../Deck/Hand/SuperHand.js";
import { SuperPlayer } from "./SuperPlayer.abstract.js";
export abstract class AllowedSuperPlayer extends SuperPlayer {
  asSuperPlayer: SuperPlayer;
  game: DurakGame;
  superHand: SuperHand;

  // REVIEW ctor, may have bugs
  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer);
    this.asSuperPlayer = superPlayer;
    this.game = game;
    this.superHand = new SuperHand(superPlayer.hand);
  }

  _makeMove(): Promise<GameMove<AllowedSuperPlayer>>;
  _makeMove(
    _card: Card | CardDTO | ReturnType<Card["asString"]>,
    _slot: DeskSlot | number,
  ): Promise<GameMove<AllowedSuperPlayer>>;
  async _makeMove(
    cardLike?: unknown,
    slotData?: unknown,
  ): Promise<GameMove<AllowedSuperPlayer>> {
    if (!cardLike && !slotData) {
      return this.makeStopMove();
    }
    const card = this.hand.getValidCard(cardLike);
    const slot = this.game.desk.getValidSlot(slotData);
    return this.makeInsertMove(card, slot);
  }

  asLatest() {
    const latest = this.game.players.get((player) => player.id === this.id);
    // FIXME here can be throw which are not needed
    // ? FIXME ?
    assert.ok(latest.isAllowed());
    return latest;
  }

  isAllowed(): this is AllowedSuperPlayer {
    return true;
  }
  isAttacker(): this is Attacker {
    return this.asSuperPlayer.isAttacker();
  }
  isDefender(): this is Defender {
    return this.asSuperPlayer.isDefender();
  }

  makeNewMove(): Promise<void>;
  makeNewMove(
    _card: Card | CardDTO | ReturnType<Card["asString"]>,
    _slot: DeskSlot | number,
  ): Promise<void>;
  async makeNewMove(cardLike?: unknown, slotData?: unknown) {
    return this.game.handleNewMove(await this._makeMove(cardLike, slotData));
  }

  remove(cb: (_card: Card) => boolean) {
    const card = this.superHand.remove(cb);
    this.wsService.remove(card, this);
    return card;
  }

  setTimer() {
    this.defaultBehavior.setTimeout();
    assert.ok(typeof this.defaultBehavior.callTime !== "undefined");
    this.game.info.namespace
      .to(this.id)
      .emit("allowedPlayer::defaultBehavior", {
        defaultBehavior: {
          callTime: {
            UTC: this.defaultBehavior.callTime.UTC,
          },
        },
      });
    this.game.info.namespace
      .except(this.id)
      .emit("allowedPlayer::defaultBehavior", {
        allowedPlayer: { id: this.id },
        defaultBehavior: {
          callTime: {
            UTC: this.defaultBehavior.callTime.UTC,
          },
        },
      });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      whenMayBecomeDisallowed: { UTC: this.defaultBehavior.callTime?.UTC },
    };
  }

  abstract asAllowedAgain(): AllowedSuperPlayer;

  abstract asDisallowed(): SuperPlayer;

  abstract defaultBehavior: DefaultBehavior<AllowedSuperPlayer>;

  abstract makeInsertMove(
    _card: Card,
    _slot: DeskSlot,
  ): Promise<GameMove<AllowedSuperPlayer>>;

  abstract makeStopMove(): GameMove<AllowedSuperPlayer>;
}
