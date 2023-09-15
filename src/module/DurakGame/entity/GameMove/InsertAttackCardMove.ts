import type DurakGame from "../../DurakGame.js";
import { AllowedAttacker } from "../Player/AllowedAttacker.js";
import type Card from "../Card/index.js";
import type DeskSlot from "../DeskSlot/index.js";
import InsertGameMove from "./InsertGameMove.abstract.js";

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
