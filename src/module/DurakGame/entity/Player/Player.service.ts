import { Player, PlayerKind, playerKinds } from "./index";
import Card from "../Card";
import CardDTO from "../../DTO/Card.dto";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import assert from "node:assert";

export default class GamePlayerWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  receiveCards({ player, cards }: { player: Player; cards: Card[] }) {
    this.namespace.to(player.id).emit(
      "player__receiveCards",
      cards.map((card) => new CardDTO(card)),
    );
    this.namespace
      .except(player.id)
      .emit("player__changeCardCount", player.id, player.hand.count);
  }

  removeCard({ player, card }: { player: Player; card: Card }) {
    this.namespace
      .to(player.id)
      .emit("superPlayer__removeCard", new CardDTO(card));
    this.namespace
      .except(player.id)
      .emit("player__changeCardCount", player.id, player.hand.count);
  }

  emitOwnKind(player: Player) {
    assert.ok(isPlayerKind(player.constructor.name));
    this.namespace.emit(
      "player__changeKind",
      player.constructor.name,
      player.id,
    );
  }

  exitGame(player: Player) {
    this.namespace.emit("player__exitGame", player.id);
  }
}

function isPlayerKind(kind: string | PlayerKind): kind is PlayerKind {
  return playerKinds.includes(kind as PlayerKind);
}
