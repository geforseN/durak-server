import { type DurakGameSocket } from "@durak-game/durak-dts";
import type Card from "../Card/index.js";
import { type BasePlayer } from "./BasePlayer.abstract.js";
import { AllowedSuperPlayer } from "./AllowedSuperPlayer.abstract.js";

export default class GamePlayerWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  receiveCards(cards: Card[], player: BasePlayer) {
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
        // TODO fully remove isAllowed if do not need this
        // because isAllowed will be true if kind includes 'Allowed'
        // isAllowed: player.isAllowed(),
      },
    });
    this.namespace.except(player.id).emit("player::changedKind", {
      player: {
        id: player.id,
        newKind: player.kind,
        // isAllowed: player.isAllowed(),
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
