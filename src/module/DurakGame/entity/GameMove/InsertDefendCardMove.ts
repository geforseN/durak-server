import assert from "node:assert";
import type DurakGame from "../../DurakGame";
import { AllowedDefender } from "../Player/AllowedDefender";
import type Card from "../Card";
import { SuccessfulDefense } from "../DefenseEnding";
import type DeskSlot from "../DeskSlot";
import { type CanCommandNextMove, type CardInsert } from "./GameMove.abstract";
import InsertGameMove from "./InsertGameMove.abstract";

export default class InsertDefendCardMove
  extends InsertGameMove<AllowedDefender>
  implements CardInsert, CanCommandNextMove
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

  calculateNextThingToDoInGame() {
    if (!this.game.desk.isDefended) {
      this.game.players = this.game.players.with(
        this.performer.asAllowedAgain(),
      );
      return this.performer.asLatest();
    }
    if (this.performer.hand.isEmpty || !this.game.desk.isAllowsMoves) {
      return new SuccessfulDefense(this.game);
    }
    if (this.game.desk.allowsAttackerMove) {
      this.game.players = this.game.players
        .with(this.performer.asDisallowed())
        .with(this.game.round.primalAttacker.asAttacker().asAllowed(this.game));
      assert.ok(this.game.players.attacker.isAllowed());
      return this.game.players.attacker;
    }
    // TODO understand cases when code will reach here
    console.log("look at me -> handleAfterCardInsert <- look at me");
    this.game.players = this.game.players.with(this.performer.asAllowedAgain());
    return this.performer.asLatest();
  }
}
