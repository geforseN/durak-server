import DurakGame from "../../DurakGame";
import Card from "../Card";
import DeskSlot from "../DeskSlot";
import { InsertAttackCardMove, StopAttackMove } from "../GameMove";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract";
import { Attacker } from "./Attacker";
import AllowedAttackerDefaultBehavior from "./DefaultBehavior/AllowedAttackerDefaultBehavior";
import { type SuperPlayer } from "./SuperPlayer.abstract";

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
      // REVIEW - can work incorrect
      this.game.round.moves.latestDoneMove.isInsertMove() &&
      this.game.round.moves.latestDoneMove.performer.id === this.id
    );
  }
}
