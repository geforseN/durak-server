import assert from "node:assert";
import { z } from "zod";
import durakGamesStore from "@/common/durakGamesStore.js";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import type { WebSocket } from "ws";

export default <FastifyPluginAsyncZod>async function (app) {
  app.get(
    "/games/:gameId",
    {
      websocket: true,
      schema: {
        params: z.object({
          gameId: z.string(),
        }),
      },
    },
    async function (socket, request) {
      const { gameId } = request.params;
      const game = await new Promise((resolve, reject) => {
        const game = durakGamesStore.get(gameId);
        if (game) {
          this.log.info("found game instantly", { gameId });
          resolve(game);
        }
        const timeout = 1500;
        setTimeout(() => {
          const game = durakGamesStore.get(gameId);
          if (game) {
            this.log.info("found game after timeout", { timeout, gameId });
            resolve(game);
          } else {
            reject();
          }
        }, timeout);
      }).catch(() => null);
      if (!game) {
        return this.log.info("game not found", { gameId });
      }
      this.log.info("connected to game %s", gameId);
      const asyncGame = Promise.withResolvers<{
        game: DurakGame;
        player: {
          id: string;
          sockets: WebSocket[];
        };
      }>();
      assert.ok(request.session.user, "session has no user");
      const playerId = request.session.user.id;
      this.log.info("connected to game", { gameId, playerId });
      asyncGame.promise.then(({ game, player }) => {
        for (const socket of player.sockets) {
          const playerId = player.id;
          this.log.info("game ready, adding socket listeners", {
            gameId,
            playerId,
          });
          // socket.join(playerId);
          const gamePlayer = game.players.get(
            (player) => player.id === playerId,
          );
          this.log.info('sending "game::state::restore"', { gameId, playerId });
          socket.send(
            JSON.stringify({
              event: "game::state::restore",
              state: {
                __allowedPlayer: game.players.allowed.toJSON(),
                desk: game.desk.toJSON(),
                discard: game.discard.toJSON(),
                enemies: gamePlayer.enemies,
                round: game.round.toJSON(),
                self: gamePlayer.toSelf(),
                settings: game.settings,
                status: game.info.status,
                talon: game.talon.toJSON(),
              },
            }),
          );
        }
      });
      if (/* is game already started */ game instanceof DurakGame) {
        this.log.info("game already started", { gameId });
        asyncGame.resolve({
          game,
          player: {
            id: playerId,
            sockets: [socket],
          },
        });
      } else if (game instanceof NonStartedDurakGame) {
        this.log.info("game is not started yet", { gameId });
        game.addPlayerConnection(playerId, socket);
        if (!game.isAllPlayersConnected) {
          return this.log.info("not all players connected yet", { gameId });
        }
        this.log.info("all players connected", { gameId });
        this.log.info("all players connected", { gameId });
        const storeGame = durakGamesStore.get(game.info.id);
        let startedGame: DurakGame;
        if (storeGame instanceof DurakGame) {
          this.log.warn('race condition "game" in "durakGamesStore"');
          startedGame = storeGame;
        } else if (storeGame) {
          this.log.info("adding DurakGame", { gameId });
          startedGame = new DurakGame(game);
          durakGamesStore.set(gameId, startedGame);
          this.log.info("set DurakGame in store", { gameId });
        } else {
          throw new Error("storeGame is not DurakGame or NonStartedDurakGame");
        }
        const playerSocketsSet = game.sockets.get(playerId);
        assert.ok(playerSocketsSet);
        asyncGame.resolve({
          game: startedGame,
          player: {
            id: playerId,
            sockets: [...playerSocketsSet],
          },
        });
      }
    },
  );
};
