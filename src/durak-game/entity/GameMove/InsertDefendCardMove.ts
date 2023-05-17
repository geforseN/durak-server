import { DefenderMove } from "./DefenderMove";

import Card from "../Card";

type ConstructorArg =
  ConstructorParameters<typeof DefenderMove>[number]
  & { card: Card, slotIndex: number };

export class InsertDefendCardMove extends DefenderMove {
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

  handleAfterCardInsert() {
    if (!this.game.desk.isDefended) {
      return this.game.round.giveDefenderMove();
    }
    if ((!this.player.hand.count || !this.game.desk.allowsMoves)) {
      return this.game.handleWonDefence(this.player);
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.game.round.givePrimalAttackerMove();
    }
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.game.round.giveDefenderMove();
  }
}