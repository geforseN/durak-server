import type DurakGame from "@/module/DurakGame/DurakGame.js";
import { AllowedAttacker } from "@/module/DurakGame/entity/Player/AllowedAttacker.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/index.js";
import InsertGameMove from "@/module/DurakGame/entity/GameMove/InsertGameMove.abstract.js";

export default class InsertAttackCardMove extends InsertGameMove<AllowedAttacker> {
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

  get gameMutationStrategy() {
    if (
      this.performer.hand.isEmpty ||
      this.game.players.defender.canNotDefend(
        this.game.desk.unbeatenSlots.cardCount,
      ) ||
      !this.game.desk.allowsAttackerMove
    ) {
      return this.strategies.letDefenderMove;
    }
    return this.strategies.letPerformerMoveAgain;
  }
}
