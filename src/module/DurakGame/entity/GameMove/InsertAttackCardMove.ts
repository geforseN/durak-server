import assert from "node:assert";
import type DurakGame from "../../DurakGame";
import { AllowedAttacker } from "../Player/AllowedAttacker";
import type Card from "../Card";
import type DeskSlot from "../DeskSlot";
import { type CanCommandNextMove } from "./GameMove.abstract";
import InsertGameMove from "./InsertGameMove.abstract";

export default class InsertAttackCardMove
  extends InsertGameMove<AllowedAttacker>
  implements CanCommandNextMove
{
  constructor(
    game: DurakGame,
    performer: AllowedAttacker,
    context: {
      card: Card;
      slot: DeskSlot;
    },
  ) {
    super(game, performer, context);
  }

  calculateNextThingToDoInGame() {
    if (
      this.performer.hand.isEmpty ||
      this.game.players.defender.canNotDefend(
        this.game.desk.unbeatenSlots.cardCount,
      ) ||
      !this.game.desk.allowsAttackerMove
    ) {
      this.game.players = this.game.players
        .with(this.performer.asDisallowed())
        .with(this.game.players.defender.asAllowed(this.game));
      assert.ok(this.game.players.defender.isAllowed());
      return this.game.players.defender;
    }
    this.game.players = this.game.players.with(this.performer.asAllowedAgain());
    return this.performer.asLatest();
  }
}