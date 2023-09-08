import { type DurakGameSocket } from "@durak-game/durak-dts";
import Card from "../Card/index.js";
import { type BasePlayer } from "./BasePlayer.abstract.js";

export default class GamePlayerWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  receiveCards({ player, cards }: { player: BasePlayer; cards: Card[] }) {
    this.namespace.to(player.id).emit("player::receiveCards", {
      player: {
        addedCards: cards.map((card) => card.toJSON()),
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

  removeCard({ player, card }: { player: BasePlayer; card: Card }) {
    this.namespace.to(player.id).emit("player::removeCard", {
      player: { newCardsCount: player.hand.count },
      card: card.toJSON(),
    });
    this.namespace.except(player.id).emit("player::removeCard", {
      player: {
        id: player.id,
        newCardsCount: player.hand.count,
      },
    });
  }

  emitOwnKind(player: BasePlayer) {
    this.namespace.to(player.id).emit("player::changedKind", {
      player: {
        newKind: player.kind,
      },
    });
    this.namespace.except(player.id).emit("player::changedKind", {
      player: {
        id: player.id,
        newKind: player.kind,
      },
    });
  }

  exitGame(player: BasePlayer) {
    this.namespace.to(player.id).emit("player::leftGame");
    this.namespace
      .except(player.id)
      .emit("player::leftGame", { player: { id: player.id } });
  }
}
