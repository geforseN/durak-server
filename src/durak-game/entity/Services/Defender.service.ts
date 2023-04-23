import { GamesIO } from "../../../namespaces/games/games.types";
import { Defender } from "../Players";
import Card from "../Card";

export default class GameDefenderService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  receiveCards({ defender, cards }: { defender: Defender, cards: Card[] }) {
    this.namespace.to(defender.id).emit("player__receiveCards", cards);
    this.namespace.except(defender.id).emit("enemy__changeCardCount", defender.id, defender.hand.count);
  }
}