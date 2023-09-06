import { GameMove } from ".";
import { Card } from "..";
import DurakGame from "../../DurakGame";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract";
import DeskSlot from "../DeskSlot";

export default abstract class InsertGameMove<
  ASP extends AllowedSuperPlayer,
> extends GameMove<ASP> {
  card: Card;
  slot: DeskSlot;

  constructor(
    game: DurakGame,
    performer: ASP,
    { card, slot }: { card: Card; slot: DeskSlot },
  ) {
    super(game, performer);
    this.card = card;
    this.slot = slot;
  }

  override isInsertMove(): this is InsertGameMove<ASP> {
    return true;
  }

  makeTransferFromAllowedSuperPlayerToDesk() {
    // NOTE: cb can be overwritten to (card) => card.hasSame({ suit: this.suit, rank: this.rank })
    const card = this.performer.hand.remove((card) => card === this.card);
    // NOTE second param can be this.card, because card (from hand remove) === this.card
    this.game.desk.updateSlot(this.slot, card);
  }
}
