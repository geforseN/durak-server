import { DurakGameSocket } from "@durak-game/durak-dts";
import { GameType } from "@prisma/client";
import assert from "node:assert";

import type DurakGame from "@/module/DurakGame/DurakGame.js";

import durakGamesStore from "@/modules/durak-game/durak-games-store-singleton.js";
import raise from "@/common/raise.js";

export default class DurakGameWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  end(gameToRemove: DurakGame) {
    this.namespace
      .to(gameToRemove.info.id)
      // @ts-expect-error id can be undefined, should change lib type
      .emit("game::over", { durak: { id: gameToRemove.info.durakId } });
    this.namespace.socketsLeave(gameToRemove.info.id);
    // TODO: uncomment when history is implemented
    // gameToRemove.history.players.forEach((player) => {
    //   this.namespace.socketsLeave(player.id);
    // });
    durakGamesStore.delete(gameToRemove);
    const gameType = gameToRemove.settings.type.toUpperCase();
    assert.ok(gameType === GameType.BASIC || gameType === GameType.PEREVODNOY);
    if (!gameToRemove.info.shouldWriteEndedGameInDatabase) {
      return;
    }
  }

  restoreState(game: DurakGame, socket: DurakGameSocket.Socket) {
    const playerId = socket.data.user?.id || raise();
    const player = game.players.get((player) => player.id === playerId);
    socket.emit("game::state::restore", {
      state: {
        __allowedPlayer: game.players.allowed.toJSON(),
        desk: game.desk.toJSON(),
        discard: game.discard.toJSON(),
        // @ts-expect-error need to type it better if possible, try use satisfies in getter
        enemies: player.enemies,
        round: game.round.toJSON(),
        // @ts-expect-error need to type it better if possible, try use satisfies in method
        self: player.toSelf(),
        settings: game.settings,
        status: game.info.status,
        talon: game.talon.toJSON(),
      },
    });
  }
}
