import Card from "../Card";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import { SuperPlayer } from "../Player";
import CardDTO from "../../DTO/Card.dto";

export default class GameDeskWebscoketService {
  constructor(private namespace: DurakGameSocket.Namespace) {
  }

  clear() {
    this.namespace.emit("desk__clear");
  }

  receiveCard({ card, index, who }: { card: Card, index: number, who: SuperPlayer }) {
    this.namespace.emit("desk__cardReceive", new CardDTO(card), index, who.id);
  }
}