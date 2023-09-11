import assert from "node:assert";
import type DurakGame from "../../DurakGame.js";
import type Card from "../Card/index.js";
import SuperHand from "../Deck/Hand/SuperHand.js";
import type DeskSlot from "../DeskSlot/index.js";
import type GameMove from "../GameMove/GameMove.abstract.js";
import type { Attacker } from "./Attacker.js";
import type DefaultBehavior from "./DefaultBehavior/DefaultBehavior.js";
import type { Defender } from "./Defender.js";
import { SuperPlayer } from "./SuperPlayer.abstract.js";

export abstract class AllowedSuperPlayer extends SuperPlayer {
  asSuperPlayer: SuperPlayer;
  game: DurakGame;
  superHand: SuperHand;

  abstract defaultBehavior: DefaultBehavior<AllowedSuperPlayer>;

  // REVIEW ctor, may have bugs
  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer);
    this.asSuperPlayer = superPlayer;
    this.game = game;
    this.superHand = new SuperHand(superPlayer.hand);
  }

  asLatest() {
    const latest = this.game.players.get((player) => player.id === this.id);
    assert.ok(latest.isAllowed());
    return latest;
  }

  isAttacker(): this is Attacker {
    return this.asSuperPlayer.isAttacker();
  }

  isDefender(): this is Defender {
    return this.asSuperPlayer.isDefender();
  }

  isAllowed(): this is AllowedSuperPlayer {
    return true;
  }

  abstract asAllowedAgain(): AllowedSuperPlayer;

  abstract asDisallowed(): SuperPlayer;

  remove(cb: (card: Card) => boolean) {
    const card = this.superHand.remove(cb);
    this.wsService.remove(card, this);
    return card;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      whenMayBecomeDisallowed: { UTC: this.defaultBehavior.callTime?.UTC },
    };
  }

  abstract makeInsertMove(
    card: Card,
    slot: DeskSlot,
  ): Promise<GameMove<AllowedSuperPlayer>>;

  abstract makeStopMove(): GameMove<AllowedSuperPlayer>;
}
