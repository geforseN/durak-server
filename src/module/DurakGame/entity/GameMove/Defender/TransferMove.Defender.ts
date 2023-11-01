import { DefenderMove } from "./DefenderMove";
import Card from "../../Card";
import { AfterHandler, insertCardStrategy } from "../../GameRound";

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
    return insertCardStrategy.call(this);
  }

  handleAfterMoveIsDone() {
    // TODO: fix hard to catch bug in this.#defeaultBeheviour
    // should be this.#defaultBehaviour redefined
    // when this.player become Attacker (code line below)
    // or should just clearInterval(this.defaultBehaviour)
    this.game.players.manager.makeNewAttacker(this.player);
    return this.game.round.giveAttackerLeftDefend();
  }
}
