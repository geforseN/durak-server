import { AttackerMove } from "./AttackerMove";
import Card from "../Card";

type ConstructorArg =
  ConstructorParameters<typeof AttackerMove>[number]
  & { card: Card, slotIndex: number };

export class InsertAttackCardMove extends AttackerMove {
  card: Card;
  slotIndex: number;

  constructor(arg: ConstructorArg) {
    super(arg);
    this.card = new Card(arg.card);
    this.slotIndex = arg.slotIndex;
    this.#insertCard();
  }

  #insertCard() {
    return this.game.desk.receiveCard({
      card: this.card,
      index: this.slotIndex,
      who: this.player,
    });
  }

  handleAfterCardInsert() {
    if (this.player.hand.isEmpty
      || !this.game.players.defender.canDefend(this.game.desk.unbeatenCardCount)
      || !this.game.desk.allowsAttackerMove
    ) {
      return this.game.round.giveDefenderLastChance();
    }
    return this.game.round.giveCurrentAttackerMove();
  }
}