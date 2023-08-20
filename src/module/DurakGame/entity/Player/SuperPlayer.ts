import Player from "./Player";
import Card from "../Card";
import { CardDTO } from "../../DTO";
import GameRound from "../GameRound";

export default abstract class SuperPlayer extends Player {
  remove(cb: (card: Card) => boolean): Card {
    const card = this.hand.remove(cb);
    this.wsService?.removeCard({ player: this, card });
    return card;
  }

  @logGetter()
  get randomCard() {
    return this.hand.randomCard;
  }

  abstract stopMove(round: GameRound): void;
  abstract putCardOnDesk(
    round: GameRound,
    card: CardDTO,
    slotIndex: number,
  ): Promise<void>;
}

function logGetter(headMessage = "LOG:") {
  return function <This, Return>(
    target: (this: This) => Return,
    context: ClassGetterDecoratorContext<This, Return>,
  ) {
    return function (this: This): Return {
      const returnValue = target.call(this);
      console.log(
        `${headMessage}: ${context.name.toString()} => ${returnValue}'.`,
      );
      return returnValue;
    };
  };
}
