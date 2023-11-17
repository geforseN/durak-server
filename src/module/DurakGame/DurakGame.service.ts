import { DurakGameSocket } from "@durak-game/durak-dts";
import { GameType } from "@prisma/client";
import assert from "node:assert";

import type DurakGame from "./DurakGame.js";

import prisma from "../../../prisma/index.js";
import durakGamesStore from "../../common/durakGamesStore.js";
import raise from "../../common/raise.js";

export default class DurakGameWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  // TODO rework code
  #saveEndedGameInDB(gameToRemove: DurakGame) {
    prisma.durakGame
      .create({
        data: {
          cardCount: gameToRemove.settings.cardCount,
          gameType,
          moveTime: gameToRemove.settings.moveTime,
          players: {
            create: gameToRemove.history.players.map(
              (player) => ({
                hasLost: gameToRemove.info.durakId === player.id,
                index: player.index,
                place: player.place,
                result:
                  gameToRemove.info.durakId === player.id ? "LOST" : "WON",
                roundLeftNumber: player.roundLeftNumber,
                userId: player.id,
              }),
            ),
          },
          playersCount: gameToRemove.settings.userCount,
          status: "ENDED",
          uuid: gameToRemove.info.id,
        },
        include: { players: true },
      })
      .then((game) => {
        gameToRemove.logger.info(game, "Game was created");
        game.players.forEach((player) => {
          prisma.userGameStat.update({
            data: player.hasLost
              ? { lostGamesCount: { increment: 1 } }
              : { wonGamesCount: { increment: 1 } },
            where: { userId: player.userId },
          });
        });
      })
      .catch((reason) =>
        gameToRemove.logger.error({ reason }, "Game was not created"),
      );
  }

  end(gameToRemove: DurakGame) {
    this.namespace
      .to(gameToRemove.info.id)
      .emit("game::over", { durak: { id: gameToRemove.info.durakId } });
    this.namespace.socketsLeave(gameToRemove.info.id);
    gameToRemove.history.players.forEach((player) => {
      this.namespace.socketsLeave(player.id);
    });
    durakGamesStore.removeStartedGame(gameToRemove);
    const gameType = gameToRemove.settings.type.toUpperCase();
    assert.ok(gameType === GameType.BASIC || gameType === GameType.PEREVODNOY);
    if (!gameToRemove.info.shouldWriteEndedGameInDatabase) {
      return;
    }
    this.#saveEndedGameInDB(gameToRemove);
  }

  restoreState(game: DurakGame, socket: DurakGameSocket.Socket) {
    const playerId = socket.data.user?.id || raise();
    const player = game.players.get((player) => player.id === playerId);
    socket.emit("game::state::restore", {
      state: {
        __allowedPlayer: game.players.allowed.toJSON(),
        desk: game.desk.toJSON(),
        discard: game.discard.toJSON(),
        enemies: player.enemies,
        round: game.round.toJSON(),
        self: player.toSelf(),
        settings: game.settings,
        status: game.info.status,
        talon: game.talon.toJSON(),
      },
    });
  }
}
