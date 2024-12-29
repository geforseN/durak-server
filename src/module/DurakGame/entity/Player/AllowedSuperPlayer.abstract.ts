import type { Card as CardDTO } from "@durak-game/durak-dts";

import assert from "node:assert";

import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import type GameMove from "@/module/DurakGame/entity/GameMove/GameMove.abstract.js";
import type { Attacker } from "@/module/DurakGame/entity/Player/Attacker.js";
import type { Defender } from "@/module/DurakGame/entity/Player/Defender.js";

import SuperHand from "@/module/DurakGame/entity/Deck/Hand/SuperHand.js";
import { SuperPlayer } from "@/module/DurakGame/entity/Player/SuperPlayer.abstract.js";

export abstract class AllowedSuperPlayer extends SuperPlayer {
  superHand: SuperHand;

  constructor(
    readonly superPlayer: SuperPlayer,
    readonly game: DurakGame,
  ) {
    super(superPlayer);
    this.superHand = new SuperHand(superPlayer.hand._cards);
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
    return this.superPlayer.isAttacker();
  }
  isDefender(): this is Defender {
    return this.superPlayer.isDefender();
  }

  toJSON() {
    return {
      ...super.toJSON(),
    };
  }

  abstract asAllowedAgain(): AllowedSuperPlayer;

  abstract asDisallowed(): SuperPlayer;

  abstract makeInsertMove(
    _card: Card,
    _slot: DeskSlot,
  ): GameMove<AllowedSuperPlayer>;

  abstract makeStopMove(): GameMove<AllowedSuperPlayer>;
}

export default AllowedSuperPlayer;
