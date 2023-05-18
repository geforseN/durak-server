import { DefenderMove } from "./DefenderMove";
import Card from "../entity/Card";
import { AfterHandler } from "../entity/GameRound";

type ConstructorArg =
  ConstructorParameters<typeof DefenderMove>[number]
  & { card: Card, slotIndex: number };

export class TransferMove extends DefenderMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ card, slotIndex, ...arg }: ConstructorArg) {
    super(arg);
    this.card = this.player.remove({ card });
    this.slotIndex = slotIndex;
    this.#insertTransferCardOnDesk();
  }

  #insertTransferCardOnDesk() {
    return this.game.desk.receiveCard({
      card: this.card,
      index: this.slotIndex,
      who: this.player,
    });
  }

  handleAfterInitialization() {
    this.game.players.manager.makeNewAttacker(this.player);
    return this.game.round.giveAttackerLeftDefend();
  }
}