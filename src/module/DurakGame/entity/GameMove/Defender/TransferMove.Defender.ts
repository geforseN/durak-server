import { DefenderMove } from "./DefenderMove";
import Card from "../../Card";
import { AfterHandler, insertCard } from "../../GameRound";

type ConstructorArg = ConstructorParameters<typeof DefenderMove>[number] & {
  card: Card;
  slotIndex: number;
};

export class TransferMove extends DefenderMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ card, slotIndex, ...arg }: ConstructorArg) {
    super(arg);
    this.card = this.player.remove({ card });
    this.slotIndex = slotIndex;
    this.#insertCard();
  }

  #insertCard() {
    return insertCard.call(this);
  }

  handleAfterInitialization() {
    this.game.players.manager.makeNewAttacker(this.player);
    return this.game.round.giveAttackerLeftDefend();
  }
}
