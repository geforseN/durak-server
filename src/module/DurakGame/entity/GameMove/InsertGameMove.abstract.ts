import GameMove from "@/module/DurakGame/entity/GameMove/GameMove.abstract.js";
import Card from "@/module/DurakGame/entity/Card/index.js";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";

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

  makeCardInsert() {
    this.performer.withRemoved((card) => card === this.card);
    this.game.round.desk = this.game.round.desk.with(this.slot, this.card);
  }
}
