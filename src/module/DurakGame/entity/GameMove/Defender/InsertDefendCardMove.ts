import DefenderMove from "./DefenderMove";
import { insertCardStrategy } from "../../GameRound";
import { type AfterHandler } from "../GameMove.abstract";
import type Card from "../../Card";
import { SuccessfulDefence } from "../../../SuccessfulDefence";

type ConstructorArg = ConstructorParameters<typeof DefenderMove>[number] & {
  card: Card;
  slotIndex: number;
};

export class InsertDefendCardMove extends DefenderMove implements AfterHandler {
  card: Card;
  slotIndex: number;

  constructor({
    game,
    player,
    card: { suit, rank },
    slotIndex,
  }: ConstructorArg) {
    super({ game, player });
    this.card = player.remove((card) => card.hasSame({ suit, rank }));
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
    if (this.player.hand.isEmpty || !this.game.desk.allowsMoves) {
      return new SuccessfulDefence(this.game).pushNewRound();
    }
    if (this.game.desk.allowsAttackerMove) {
      return this.game.round.givePrimalAttackerAttack();
    }
    console.log("look at me -> handleAfterCardInsert <- look at me");
    return this.game.round.giveDefenderDefend();
  }
}
