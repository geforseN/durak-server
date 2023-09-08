import type { DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "../Card/index.js";
import type { SuperPlayer } from "../Player/SuperPlayer.abstract.js";

export default class GameDeskWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  clear() {
    this.namespace.emit("desk::becameClear");
  }

  receiveCard({
    card,
    index,
    source,
  }: {
    card: Card;
    index: number;
    source: SuperPlayer;
  }) {
    this.namespace.emit("desk::receivedCard", {
      card: card.toJSON(),
      slot: { index },
      source: { id: source.id },
    });
  }
}
