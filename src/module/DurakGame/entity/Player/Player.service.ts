import { type DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "../Card/index.js";
import { type BasePlayer } from "./BasePlayer.abstract.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";

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

  remove(card: Card, performer: AllowedSuperPlayer) {
    this.namespace.to(performer.id).emit("player::removeCard", {
      player: { newCardsCount: performer.hand.count },
      card: card.toJSON(),
    });
    this.namespace.except(performer.id).emit("player::removeCard", {
      player: {
        id: performer.id,
        newCardsCount: performer.hand.count,
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
