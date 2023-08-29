import type Card from "../Card";
import SuperHand from "../Deck/Hand/SuperHand";
import Player from "./Player";

export default abstract class SuperPlayer extends Player<SuperHand> {
  constructor(player: Player) {
    super(player, { hand: new SuperHand([...player.hand]) });
  }

  remove(cb: (card: Card) => boolean): Card {
    const card = this.hand.remove(cb);
    this.wsService?.removeCard({ player: this, card });
    return card;
  }

  get randomCard() {
    return this.hand.randomCard;
  }
}
