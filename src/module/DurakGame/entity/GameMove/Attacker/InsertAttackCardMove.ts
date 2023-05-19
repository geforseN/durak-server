import { AttackerMove } from "./AttackerMove";
import Card from "../../Card";
import { AfterHandler } from "../../GameRound";

type ConstructorArg =
  ConstructorParameters<typeof AttackerMove>[number]
  & { card: Card, slotIndex: number };

export class InsertAttackCardMove extends AttackerMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ card, slotIndex, ...arg }: ConstructorArg) {
    super(arg);
    this.card = this.player.remove({ card });
    this.slotIndex = slotIndex;
    this.#insertAttackCardOnDesk();
  }

  #insertAttackCardOnDesk() {
    return this.game.desk.receiveCard({
      card: this.card,
      index: this.slotIndex,
      who: this.player,
    });
  }

  handleAfterInitialization() {
    if (this.player.hand.isEmpty
      || !this.game.players.defender.canDefend(this.game.desk.unbeatenCardCount)
      || !this.game.desk.allowsAttackerMove
    ) {
      return this.game.round.giveDefenderLastChance();
    }
    return this.game.round.giveAttackerAttack();
  }
}