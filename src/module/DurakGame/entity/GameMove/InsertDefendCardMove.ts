import assert from "node:assert";
import type DurakGame from "../../DurakGame.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";
import type Card from "../Card/index.js";
import { SuccessfulDefense } from "../DefenseEnding/index.js";
import type DeskSlot from "../DeskSlot/index.js";
import { type CanCommandNextMove, type CardInsert } from "./GameMove.abstract.js";
import InsertGameMove from "./InsertGameMove.abstract.js";

export default class InsertDefendCardMove
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

  calculateNextThingToDoInGame() {
    if (!this.game.desk.isDefended) {
      this.game.players.mutateWith(
        this.performer.asAllowedAgain(),
      );
      return this.performer.asLatest();
    }
    if (this.performer.hand.isEmpty || !this.game.desk.isAllowsMoves) {
      return new SuccessfulDefense(this.game);
    }
    if (this.game.desk.allowsAttackerMove) {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(this.game.round.primalAttacker.asAttacker().asAllowed(this.game));
      assert.ok(this.game.players.attacker.isAllowed());
      return this.game.players.attacker;
    }
    // TODO understand cases when code will reach here
    console.log("look at me -> handleAfterCardInsert <- look at me");
    this.game.players.mutateWith(this.performer.asAllowedAgain());
    return this.performer.asLatest();
  }
}
