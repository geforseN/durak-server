import Card from "../Card";
import { GamesIO } from "../../../namespaces/games/games.types";
import { SuperPlayer } from "../Players";

export default class GameDeskService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  clearDesk() {
    this.namespace.emit("desk__clear");
  }

  insertCard({ card, index, who }: { card: Card, index: number, who: SuperPlayer }) {
    this.namespace.emit("player__insertCard", card, index, who.id);
  }
}