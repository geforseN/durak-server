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
