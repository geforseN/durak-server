import { DefenderMove } from "./DefenderMove";

import Card from "../Card";
import { AfterHandler } from "../GameRound";

type ConstructorArg =
  ConstructorParameters<typeof DefenderMove>[number]
  & { card: Card, slotIndex: number };

export class InsertDefendCardMove extends DefenderMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({ card, slotIndex, ...arg }: ConstructorArg) {
    super(arg);
    this.card = this.player.remove({ card });
    this.slotIndex = slotIndex;
    this.#insertDefendCardOnDesk();
  }

  #insertDefendCardOnDesk() {
    return this.game.desk.receiveCard({
      card: this.card,
      index: this.slotIndex,
      who: this.player,
    });
  }

  handleAfterInitialization() {
    if (!this.game.desk.isDefended) {
      return this.game.round.giveDefenderDefend();
    }
    if ((!this.player.hand.count || !this.game.desk.allowsMoves)) {
      return this.game.handleWonDefence(this.player);
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.game.round.givePrimalAttackerAttack();
    }
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.game.round.giveDefenderDefend();
  }
}