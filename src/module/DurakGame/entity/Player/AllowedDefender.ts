import DurakGame from "../../DurakGame";
import Card from "../Card";
import DeskSlot from "../DeskSlot";
import {
  DefenderTransferMove,
  InsertDefendCardMove,
  StopDefenseMove,
} from "../GameMove";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract";
import { Defender } from "./Defender";
import { type SuperPlayer } from "./SuperPlayer.abstract";
import AllowedDefenderDefaultBehavior from "./DefaultBehavior/AllowedDefenderDefaultBehavior";

export class AllowedDefender extends AllowedSuperPlayer {
  defaultBehavior: AllowedDefenderDefaultBehavior;

  constructor(superPlayer: SuperPlayer, game: DurakGame) {
    super(superPlayer, game);
    this.defaultBehavior = new AllowedDefenderDefaultBehavior(this);
  }

  get kind() {
    return "AllowedDefender" as const;
  }

  asAllowedAgain(): AllowedDefender {
    return new AllowedDefender(this, this.game);
  }

  asAllowed(): AllowedDefender {
    return this.asAllowedAgain();
  }

  asDisallowed(): Defender {
    return new Defender(this);
  }

  makeTransferMove(card: Card, slot: DeskSlot) {
    return new DefenderTransferMove(this.game, this, { card, slot });
  }

  async makeInsertMove(card: Card, slot: DeskSlot) {
    if (await this.canMakeTransferMove(card, slot)) {
      return this.makeTransferMove(card, slot);
    }
    await slot.ensureCanBeDefended(card);
    return new InsertDefendCardMove(this.game, this, {
      card,
      slot,
    });
  }

  makeStopMove() {
    return new StopDefenseMove(this.game, this);
  }

  async canMakeTransferMove(card: Card, slot: DeskSlot): Promise<boolean> {
    return (
      this.left.canTakeMore(this.game.desk.cardsCount) &&
      this.game.desk.allowsTransferMove(card, slot)
    );
  }
}
