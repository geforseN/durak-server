import DefenderMove from "./DefenderMove";
import { insertCardStrategy } from "../../GameRound";
import { type AfterHandler } from "../GameMove.abstract";
import type Card from "../../Card";

type ConstructorArg = ConstructorParameters<typeof DefenderMove>[number] & {
  card: Card;
  slotIndex: number;
};

export class InsertDefendCardMove extends DefenderMove implements AfterHandler {
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
    if (!this.game.desk.isDefended) {
      return this.game.round.giveDefenderDefend();
    }
    if (!this.player.hand.count || !this.game.desk.allowsMoves) {
      return this.game.handleWonDefence();
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.game.round.givePrimalAttackerAttack();
    }
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.game.round.giveDefenderDefend();
  }
}
