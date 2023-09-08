import assert from "node:assert";
import DurakGame from "../../DurakGame";
import SuperHand from "../Deck/Hand/SuperHand";
import { Attacker } from "./Attacker";
import { Defender } from "./Defender";
import { SuperPlayer } from "./SuperPlayer.abstract";
import DefaultBehavior from "./DefaultBehavior/DefaultBehavior";
import { Hand } from "../Deck";

export abstract class AllowedSuperPlayer extends SuperPlayer {
  asSuperPlayer: SuperPlayer;
  game: DurakGame;
  abstract defaultBehavior: DefaultBehavior<AllowedSuperPlayer>;

  declare hand: SuperHand;
  _basicHand: Hand;
  _superHand: SuperHand;

  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer);
    this.asSuperPlayer = superPlayer;
    this.game = game;
    // TODO when allowed downgrade then change superHand to just hand
    // or maybe should use composition (this.hand and this.superHand)
    this._superHand = new SuperHand(superPlayer.hand);
    this.hand = new SuperHand(superPlayer.hand);
    this._basicHand = superPlayer.hand;
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
}