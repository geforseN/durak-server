import DurakGameStateDto, {
  BetterDurakGameState,
} from "./DTO/DurakGameState.dto";
import { type DurakGameSocket } from "./socket/DurakGameSocket.types";
import type DurakGame from "./DurakGame";
import { durakGames, durakGamesStore, raise } from "../..";
import prisma from "../../../prisma";
import { GameType, UserGamePlayer } from "@prisma/client";
import assert from "node:assert";

export default class DurakGameWebsocketService {
  constructor(private namespace: DurakGameSocket.Namespace) {}

  restoreState(game: DurakGame, socket: DurakGameSocket.Socket) {
    const playerId = socket.data.user?.id || raise();
    socket.emit("game::state::restore", {
      _state: new DurakGameStateDto(game, playerId),
      state: new BetterDurakGameState(game, playerId),
    });
  }

  end(gameToRemove: DurakGame) {
    gameToRemove.info.namespace.emit("game::over", {
      durak: { id: gameToRemove.info.durakId || raise() },
    });
    durakGamesStore.removeStartedGame(gameToRemove);
    prisma.$transaction(async (prisma) => {
      const gameType = gameToRemove.settings.gameType.toUpperCase();
      assert.ok(
        gameType === GameType.BASIC || gameType === GameType.PEREVODNOY,
      );
      const durakGame = await prisma.durakGame.create({
        data: {
          status: "ENDED",
          uuid: gameToRemove.info.id,
          cardCount: gameToRemove.settings.cardCount,
          moveTime: gameToRemove.settings.moveTime,
          playersCount: gameToRemove.settings.userCount,
          gameType,
        },
      });
      assert.ok(typeof gameToRemove.info.durakId !== "undefined");
      const gamePlayers = await prisma.userGamePlayer.createMany({
        data: [...gameToRemove.initialPlayers].map((player) => ({
          userId: player.id,
          index: player.index,
          durakGameNumber: durakGame.number,
          hasLost: gameToRemove.info.durakId === player.id,
          result: gameToRemove.info.durakId === player.id ? "LOST" : "WON",
          winPlace: player.place,
          winRoundNumber: player.roundLeftNumber,
        })),
      });
      assert(gamePlayers.count === gameToRemove.initialPlayers.length);
    });
  }
}
