import type DurakGame from "../../DurakGame.js";

import { AllowedDefender } from "./AllowedDefender.js";
import { type AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { type BasePlayer } from "./BasePlayer.abstract.js";
import { SuperPlayer } from "./SuperPlayer.abstract.js";

export class Defender extends SuperPlayer {
  #isSurrendered: boolean;
  public isReal: boolean;

  constructor(
    basePlayer: BasePlayer,
    {
      isPrimal = false, // TODO think about it ...
      isSurrendered = false,
    }: { isPrimal?: boolean; isSurrendered?: boolean } = {},
  ) {
    super(basePlayer);
    this.#isSurrendered = isSurrendered;
    this.isReal = isPrimal;
  }

  asAllowed(game: DurakGame): AllowedSuperPlayer {
    return new AllowedDefender(this, game);
  }

  asSurrendered() {
    return new Defender(this, { isPrimal: true, isSurrendered: true });
  }

  canNotDefend(cardCount: number) {
    return !this.canTakeMore(cardCount);
  }

  // REVIEW - code is smelly
  canWinDefense(game: DurakGame) {
    try {
      return (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        (game.round.latestPrimalAttacker.isAllowed() &&
          this.left === game.round.latestPrimalAttacker) ||
        // below statement is for more than 2 players game
        (game.players.attacker.isAllowed() &&
          game.players.attacker.left === game.round.latestPrimalAttacker)
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

  isSurrendered() {
    return this.#isSurrendered;
  }

  // TODO - rewrite
  get kind() {
    return this.#isSurrendered ? "SurrenderedDefender" : "Defender";
  }
}
