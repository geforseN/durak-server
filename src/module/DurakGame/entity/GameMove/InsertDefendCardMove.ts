import type DurakGame from "../../DurakGame.js";
import type { AllowedDefender } from "../Player/AllowedDefender.js";
import type Card from "../Card/index.js";
import { SuccessfulDefense } from "../DefenseEnding/index.js";
import type DeskSlot from "../DeskSlot/index.js";
import InsertGameMove from "./InsertGameMove.abstract.js";

export default class InsertDefendCardMove extends InsertGameMove<AllowedDefender> {
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

  get gameMutationStrategy() {
    if (!this.game.desk.isDefended) {
      return this.strategies.letPerformerMoveAgain;
    }
    if (this.performer.hand.isEmpty || !this.game.desk.isAllowsMoves) {
      return () => new SuccessfulDefense(this.game);
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.strategies.letPrimalAttackerMove;
    }
    // TODO understand cases when code will reach here
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.strategies.letPerformerMoveAgain;
  }
}
