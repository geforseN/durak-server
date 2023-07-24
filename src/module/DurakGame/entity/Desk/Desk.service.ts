import Card from "../Card";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import { SuperPlayer } from "../Player";
import CardDTO from "../../DTO/Card.dto";

export default class GameDeskWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {
  }

  clear() {
    this.namespace.emit("desk__clear");
  }

  receiveCard({ card, index, source }: { card: Card, index: number, source: SuperPlayer }) {
    this.namespace.emit("desk__cardReceive", new CardDTO(card), index, source.id);
  }
}