import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import type { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";

import SuccessfulDefense from "@/module/DurakGame/entity/DefenseEnding/SuccessfulDefense.js";
import InsertGameMove from "@/module/DurakGame/entity/GameMove/InsertGameMove.abstract.js";

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
    if (this.performer.cards.isEmpty || !this.game.desk.isAllowsMoves) {
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
