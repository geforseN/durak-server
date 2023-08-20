import { Player, PlayerKind, isPlayerKind, playerKinds } from "./index";
import Card from "../Card";
import CardDTO from "../../DTO/Card.dto";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import assert from "node:assert";

export default class GamePlayerWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  receiveCards({ player, cards }: { player: Player; cards: Card[] }) {
    this.namespace.to(player.id).emit("player::receiveCards", {
      player: {
        addedCards: cards.map((card) => new CardDTO(card)),
        handCount: player.hand.count,
      },
    });
    this.namespace.except(player.id).emit("player::receiveCards", {
      player: {
        id: player.id,
        addedCardsCount: cards.length,
        handCount: player.hand.count,
      },
    });
  }

  removeCard({ player, card }: { player: Player; card: Card }) {
    this.namespace.to(player.id).emit("player::removeCard", {
      player: { newCardsCount: player.hand.count },
      card: new CardDTO(card),
    });
    this.namespace.except(player.id).emit("player::removeCard", {
      player: {
        id: player.id,
        newCardsCount: player.hand.count,
      },
    });
  }

  emitOwnKind(player: Player) {
    assert.ok(isPlayerKind(player.constructor.name));
    this.namespace.to(player.id).emit("player::changedKind", {
      player: {
        newKind: player.constructor.name,
      },
    });
    this.namespace.except(player.id).emit("player::changedKind", {
      player: {
        id: player.id,
        newKind: player.constructor.name,
      },
    });
  }

  exitGame(player: Player) {
    this.namespace.to(player.id).emit("player::leftGame");
    this.namespace
      .except(player.id)
      .emit("player::leftGame", { player: { id: player.id } });
  }
}
