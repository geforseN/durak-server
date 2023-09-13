import type { DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "../Card/index.js";
import type { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import type DeskSlot from "../DeskSlot/DeskSlot.abstract.js";

export default class GameDeskWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  clear() {
    this.namespace.emit("desk::becameClear");
  }

  update(
    slot: DeskSlot,
    card: Card,
    performer: AllowedSuperPlayer,
  ) {
    this.namespace.emit("desk::receivedCard", {
      card: card.toJSON(),
      slot: { index: slot.index },
      performer: { id: performer.id },
    });
  }
}
