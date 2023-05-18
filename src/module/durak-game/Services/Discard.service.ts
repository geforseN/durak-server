import { GamesIO } from "../../../namespaces/games/games.types";
import Card from "../entity/Card";

export default class GameDiscardService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  emitReceivedCards(cards: Card[]) {
    this.namespace.emit("discard__receiveCards", cards.length);
  }

  emitReceivedFirstCards() {
    this.namespace.emit("discard__setIsNotEmpty")
  }
}