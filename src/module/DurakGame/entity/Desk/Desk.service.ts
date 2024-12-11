import type { DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import type DeskSlot from "@/module/DurakGame/entity/DeskSlot/DeskSlot.abstract.js";

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
