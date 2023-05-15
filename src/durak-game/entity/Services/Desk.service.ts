import Card from "../Card";
import { GamesIO } from "../../../namespaces/games/games.types";
import { SuperPlayer } from "../Players";
import CardDTO from "../../DTO/Card.dto";

export default class GameDeskService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  clear() {
    this.namespace.emit("desk__clear");
  }

  insertCard({ card, index, who }: { card: Card, index: number, who: SuperPlayer }) {
    this.namespace.emit("player__insertCard", new CardDTO(card), index, who.id);
  }
}