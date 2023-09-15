import GameMove from "./GameMove.abstract.js";
import Card from "../Card/index.js";
import DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import DeskSlot from "../DeskSlot/index.js";

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
    this.performer.remove((card) => card === this.card);
    this.game.desk.update(this.slot, this.card, this.performer);
  }

  override emitContextToPlayers() {
    this.game.info.namespace.to(this.performer.id).emit("move::new", {
      move: {
        name: this.constructor.name,
        insert: {
          card: this.card,
          slot: { index: this.slot.index },
        },
      },
    });
    this.game.info.namespace.except(this.performer.id).emit("move::new", {
      move: {
        performer: { id: this.performer.id },
        name: this.constructor.name,
        insert: {
          card: this.card,
          slot: { index: this.slot.index },
        },
      },
    });
  }
}
