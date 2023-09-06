import type DurakGame from "../../DurakGame";
import type Card from "../Card";
import { type CanCommandNextMove } from "./GameMove.abstract";
import type DeskSlot from "../DeskSlot";
import { AllowedDefender } from "../Player/AllowedDefender";
import InsertGameMove from "./InsertGameMove.abstract";
import assert from "node:assert";

export default class TransferMove
  extends InsertGameMove<AllowedDefender>
  implements CanCommandNextMove
{
  constructor(
    game: DurakGame,
    performer: AllowedDefender,
    context: {
      card: Card;
      slot: DeskSlot;
    },
  ) {
    super(game, performer, context);
  }

  //  NOTE: Also, when transferring an attack, more than one card of the original rank can be added to the attack.
  calculateNextThingToDoInGame() {
    assert.ok(
      this.performer.right.isAttacker() && !this.performer.right.isAllowed(),
    );
    //  TODO: add disallow to TransferMove if possible defender canTakeMore returns false
    this.game.players = this.game.players
      .with(this.performer.right.asPlayer())
      .with(this.performer.left.asDefender())
      .with(this.performer.asAttacker().asAllowed(this.game));
    assert.ok(
      this.performer.asLatest().isAttacker() &&
        this.performer.asLatest().isAllowed(),
    );
    return this.performer.asLatest();
  }
}
