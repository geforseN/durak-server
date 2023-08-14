import { DurakGameSocket } from "../../../socket/DurakGameSocket.types";
import { Player } from "../../Player";
import Card from "../../Card";
import Talon from "./index";

export default class GameTalonWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  provideCardsAnimation({
    player,
    cards,
    talon,
  }: {
    player: Player;
    cards: Card[];
    talon: Talon;
  }) {
    this.namespace
      .except(player.id)
      .emit("talon__distributeCardsTo", player.id, cards.length);
    this.#emitCardsRepresentation(talon, player);
  }

  #emitCardsRepresentation(talon: Talon, player: Player) {
    if (talon.isEmpty) {
      this.namespace.emit("talon__moveTrumpCardTo", player.id);
    } else if (talon.hasOneCard) {
      this.namespace.emit("talon__keepOnlyTrumpCard");
    }
  }
}
