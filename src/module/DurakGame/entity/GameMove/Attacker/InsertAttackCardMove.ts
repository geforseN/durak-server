import { AttackerMove } from "./AttackerMove";
import Card from "../../Card";
import { AfterHandler, insertCardStrategy } from "../../GameRound";

type ConstructorArg = ConstructorParameters<typeof AttackerMove>[number] & {
  card: Card;
  slotIndex: number;
};

export class InsertAttackCardMove extends AttackerMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ card, slotIndex, ...arg }: ConstructorArg) {
    super(arg);
    this.card = arg.player.removeCard({ card });
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
