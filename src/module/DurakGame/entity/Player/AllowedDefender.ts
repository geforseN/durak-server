import DurakGame from "../../DurakGame.js";
import Card from "../Card/index.js";
import DeskSlot from "../DeskSlot/index.js";
import {
  DefenderTransferMove,
  InsertDefendCardMove,
  StopDefenseMove,
} from "../GameMove/index.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";
import { Defender } from "./Defender.js";
import { type SuperPlayer } from "./SuperPlayer.abstract.js";
import AllowedDefenderDefaultBehavior from "./DefaultBehavior/AllowedDefenderDefaultBehavior.js";

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
    this.defaultBehavior.shouldBeCalled = false;
    this.defaultBehavior.clearTimeout();
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
