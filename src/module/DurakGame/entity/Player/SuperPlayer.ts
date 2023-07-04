import Player from "./Player";
import Card from "../Card";

export default abstract class SuperPlayer extends Player {
  removeCard(card: Card): Card {
    return this.hand.removeCard(card)
  }

  @logGetter()
  get randomCard() {
    return this.hand.randomCard;
  }
};

function logGetter(headMessage: string = "LOG:") {
  return function <This, Return>(
    target: (this: This) => Return,
    context: ClassGetterDecoratorContext<This, Return>,
  ) {
    return function(this: This): Return {
      const returnValue = target.call(this);
      console.log(`${headMessage}: ${context.name.toString()} => ${returnValue}'.`);
      return returnValue;
    };
  };
}