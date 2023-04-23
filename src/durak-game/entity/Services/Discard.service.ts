import { GamesIO } from "../../../namespaces/games/games.types";
import Card from "../Card";

export default class GameDiscardService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  receiveCards(cards: Card[]) {
    this.namespace.emit("discard__receiveCards", cards.length);
  }
}