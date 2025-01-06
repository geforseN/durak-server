import type DurakGame from "@/module/DurakGame/DurakGame.js";

import { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";
import { type AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import type Player from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export class Defender {
  constructor(
    basePlayer: Player,
  ) {
    super(basePlayer);
  }

  asAllowed(game: DurakGame): AllowedSuperPlayer {
    return new AllowedDefender(this, game);
  }

  asSurrendered() {
    return new Defender(this);
  }

  canNotDefend(cardCount: number) {
    return !this.hand.cards.canTakeMore(cardCount);
  }

  // REVIEW - code is smelly
  canWinDefense(game: DurakGame) {
    try {
      return (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        (game.round.primalAttackerAsLatest.isAllowed() &&
          this.left === game.round.primalAttackerAsLatest) ||
        // below statement is for more than 2 players game
        (game.players.attacker.isAllowed() &&
          game.players.attacker.left === game.round.primalAttackerAsLatest)
      );
    } catch (error) {
      // TODO if (error instanceof NoPrimalAttackerError) {}
      // TODO else throw error
      return false;
    }
  }

  isDefender(): this is Defender {
    return true;
  }

  // TODO - rewrite
  get kind() {
    return "Defender" as const;
  }
}
