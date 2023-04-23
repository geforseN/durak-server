import Card from "../Card";
import { GamesIO } from "../../../namespaces/games/games.types";
import { CanReceiveCards } from "../../DurakGame";
import { Defender, SuperPlayer } from "../Players";

export default class GameDeskService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  clearDesk() {
    this.namespace.emit("desk__clear");
  }

  provideCards({ target, cards }: { target: CanReceiveCards, cards: Card[] }) {
    if (target instanceof Defender) {
      return this.provideToDefender({ defender: target, cards });
    }
    throw new Error("Can provide cards to " + target);
  }

  private provideToDiscard({ cards }: { cards: Card[] }) {
    this.namespace.emit("discard__receiveCards", cards.length);
  }

  private provideToDefender({ defender, cards }: { defender: Defender, cards: Card[] }) {
    this.namespace.to(defender.id).emit("player__receiveCards", cards);
    this.namespace.except(defender.id).emit("enemy__changeCardCount", defender.id, defender.hand.count);
  }

  insertCard({ card, index, who }: { card: Card, index: number, who: SuperPlayer }) {
    this.namespace.emit("player__insertCard", card, index, who.id);
  }
}