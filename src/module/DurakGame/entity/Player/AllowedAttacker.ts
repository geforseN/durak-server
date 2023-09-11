import DurakGame from "../../DurakGame.js";
import Card from "../Card/index.js";
import DeskSlot from "../DeskSlot/index.js";
import { InsertAttackCardMove, StopAttackMove } from "../GameMove/index.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { Attacker } from "./Attacker.js";
import AllowedAttackerDefaultBehavior from "./DefaultBehavior/AllowedAttackerDefaultBehavior.js";
import { type SuperPlayer } from "./SuperPlayer.abstract.js";

export class AllowedAttacker extends AllowedSuperPlayer {
  defaultBehavior: AllowedAttackerDefaultBehavior;

  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer, game);
    this.defaultBehavior = new AllowedAttackerDefaultBehavior(this);
  }

  get kind() {
    return "AllowedAttacker" as const;
  }

  hasBeenPrimalAttacker() {
    try {
      return this.game.round.primalAttacker.id === this.id;
    } catch (error) {
      return false;
    }
  }

  asAllowedAgain(): AllowedAttacker {
    return new AllowedAttacker(this, this.game);
  }

  asAllowed(): AllowedAttacker {
    return this.asAllowedAgain();
  }

  asDisallowed(): Attacker {
    return new Attacker(this);
  }

  makeStopMove() {
    return new StopAttackMove(this.game, this);
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
    await this.game.desk.ensureCanAttack(card, slot);
    return new InsertAttackCardMove(this.game, this, {
      card,
      slot,
    });
  }

  get didLatestMove(): boolean {
    return (
      this.game.round.moves.latestDoneMove.isInsertMove() &&
      this.game.round.moves.latestDoneMove.performer.id === this.id
    );
  }
}
