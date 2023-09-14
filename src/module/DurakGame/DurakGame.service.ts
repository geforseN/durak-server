import DurakGameStateDto from "./DTO/DurakGameState.dto.js";
import type DurakGame from "./DurakGame.js";
import { durakGamesStore, raise } from "../../index.js";
import prisma from "../../../prisma/index.js";
import { GameType } from "@prisma/client";
import assert from "node:assert";
import { DurakGameSocket } from "@durak-game/durak-dts";

export default class DurakGameWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  restoreState(game: DurakGame, socket: DurakGameSocket.Socket) {
    const playerId = socket.data.user?.id || raise();
    const player = game.players.get((player) => player.id === playerId);
    socket.emit("game::state::restore", {
      state: {
        self: player.toSelf(),
        enemies: player.enemies,
        settings: game.settings,
        status: game.info.status,
        desk: game.desk.toJSON(),
        talon: game.talon.toJSON(),
        discard: game.discard.toJSON(),
        round: game.round.toJSON(),
      },
    });
  }

  end(gameToRemove: DurakGame) {
    assert.ok(typeof gameToRemove.info.durakId !== "undefined");
    this.namespace
      .to(gameToRemove.info.id)
      .emit("game::over", { durak: { id: gameToRemove.info.durakId } });
    this.namespace.socketsLeave(gameToRemove.info.id);
    gameToRemove.initialPlayers.forEach((player) => {
      this.namespace.socketsLeave(player.id);
    });
    durakGamesStore.removeStartedGame(gameToRemove);
    const gameType = gameToRemove.settings.gameType.toUpperCase();
    assert.ok(gameType === GameType.BASIC || gameType === GameType.PEREVODNOY);
    // TODO rework code
    prisma.durakGame
      .create({
        data: {
          status: "ENDED",
          uuid: gameToRemove.info.id,
          cardCount: gameToRemove.settings.cardCount,
          moveTime: gameToRemove.settings.moveTime,
          playersCount: gameToRemove.settings.userCount,
          gameType,
          players: {
            create: gameToRemove.initialPlayers.map((player) => ({
              userId: player.id,
              index: player.index,
              hasLost: gameToRemove.info.durakId === player.id,
              result: gameToRemove.info.durakId === player.id ? "LOST" : "WON",
              place: player.place,
              roundLeftNumber: player.roundLeftNumber,
            })),
          },
        },
        include: { players: true },
      })
      .then((game) => {
        gameToRemove.logger.info(game, "Game was created");
        game.players.forEach((player) => {
          prisma.userGameStat.update({
            where: { userId: player.userId },
            data: player.hasLost
              ? { lostGamesCount: { increment: 1 } }
              : { wonGamesCount: { increment: 1 } },
          });
        });
      })
      .catch((reason) =>
        gameToRemove.logger.error({ reason }, "Game was not created"),
      );
  }
}
