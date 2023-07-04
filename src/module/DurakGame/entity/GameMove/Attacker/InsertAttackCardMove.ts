import { AttackerMove } from "./AttackerMove";
import { insertCardStrategy } from "../../GameRound";
import { type AfterHandler } from "../GameMove.abstract";
import type Card from "../../Card";

type ConstructorArg = ConstructorParameters<typeof AttackerMove>[number] & {
  card: Card;
  slotIndex: number;
};

export class InsertAttackCardMove extends AttackerMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ game, player, card, slotIndex }: ConstructorArg) {
    super({ game, player });
    this.card = player.removeCard(card);
    this.slotIndex = slotIndex;
    this.isInsertMove = true;
    this.#insertCard();
  }

  #insertCard() {
    return insertCardStrategy.call(this);
  }

  handleAfterMoveIsDone() {
    if (
      this.player.hand.isEmpty ||
      !this.game.players.defender.canDefend(
        this.game.desk.unbeatenSlots.cardCount,
      ) ||
      !this.game.desk.allowsAttackerMove
    ) {
      return this.game.round.giveDefenderDefend();
    }
    return this.game.round.giveAttackerAttack();
  }
}
