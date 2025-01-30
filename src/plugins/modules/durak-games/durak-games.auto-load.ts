import assert from "node:assert";
import { setTimeout } from "node:timers/promises";
import z from "zod";
import type WebSocket from "ws";
import durakGamesStore from "@/modules/durak-game/durak-games-store-singleton.js";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import { GameRestoreStateEventSchema } from "@/utils/durak-game-state-restore-schema.js";

async function findInstantlyAndAfterTimeout<T>(
  timeout: number,
  findThing: () => T,
  options?: {
    isFound?(thing: T): boolean;
    onInstantFound?(): void;
    onAfterTimeoutFound?(): void;
    onNotFound?(): void;
  },
): Promise<T | undefined> {
  let thing = findThing();
  const isFound = options?.isFound ?? (() => !!thing);
  if (isFound(thing)) {
    options?.onInstantFound?.();
    return thing;
  }
  await setTimeout(timeout);
  thing = findThing();
  if (isFound(thing)) {
    options?.onAfterTimeoutFound?.();
    return thing;
  }
  options?.onNotFound?.();
}

async function findGameWithTimeout(
  gameId: string,
  timeout: number,
  log: (...args: [message: string, ...args: unknown[]]) => void,
) {
  return await findInstantlyAndAfterTimeout(
    timeout,
    () => durakGamesStore.get(gameId),
    {
      onInstantFound() {
        log("found game with id %s", gameId);
      },
      onAfterTimeoutFound() {
        log("found game with id %s after timeout %s", gameId, timeout);
      },
      onNotFound() {
        log("game with id %s not found even after timeout %s", gameId, timeout);
      },
    },
  );
}

class GameStateRestoreEvent {
  constructor(
    readonly game: DurakGame,
    readonly playerId: string,
  ) {}

  toString() {
    const { game, playerId } = this;
    const player = game.players.find((player) => player.id === playerId);
    let self, enemies;
    if (player) {
      self = player.toSelf();
      enemies = player.enemies;
    }
    const state = GameRestoreStateEventSchema.parse({
      event: "game::state::restore",
      payload: {
        ...game.toJSON(),
        self,
        enemies,
      },
    });
    return JSON.stringify(state);
  }
}

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
      const game = await findGameWithTimeout(gameId, 1500, this.log.info);
      if (!game) {
        return;
      }
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
          this.log.info('sending "game::state::restore"', { gameId, playerId });
          socket.send(new GameStateRestoreEvent(game, playerId).toString());
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
        game.connections.add(playerId, socket);
        if (!game.isAllPlayersConnected) {
          return this.log.info("not all players connected yet", { gameId });
        }
        this.log.info("all players connected", { gameId });
        this.log.info("all players connected", { gameId });
        const storeGame = durakGamesStore.get(game.id);
        let startedGame: DurakGame;
        if (storeGame instanceof DurakGame) {
          this.log.warn('race condition "game" in "durakGamesStore"');
          startedGame = storeGame;
        } else if (storeGame) {
          this.log.info("adding DurakGame", { gameId });
          startedGame = new DurakGame(game.id, game.setting);
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
