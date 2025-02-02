import DurakGame from "@/module/DurakGame/DurakGame.js";
import findInstantlyAndAfterTimeout from "@/utils/timeout/find-instantly-and-after-timeout.js";
import {
  isNotStartedGame,
  isStartedGame,
} from "@/modules/durak-game/guards.js";
import type { DurakGamesStore } from "@/modules/durak-game/store/instance.js";
import type PlayerWebSocketConnection from "@/module/DurakGame/player-websocket-connection.js";
import type { Game } from "@/modules/durak-game/types.js";
import type NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";

export async function findGameWithTimeout(
  store: DurakGamesStore,
  gameId: string,
  timeout: number,
  log: (...args: [message: string, ...args: unknown[]]) => void,
) {
  return await findInstantlyAndAfterTimeout(timeout, () => store.get(gameId), {
    onInstantFound() {
      log("found game with id %s", gameId);
    },
    onAfterTimeoutFound() {
      log("found game with id %s after timeout %s", gameId, timeout);
    },
    onNotFound() {
      log("game with id %s not found even after timeout %s", gameId, timeout);
    },
  });
}

export async function sleepUntilGameStart(
  store: DurakGamesStore,
  game: Game,
  connection: PlayerWebSocketConnection,
  makeStartedGame: (nonStarted: NonStartedDurakGame) => DurakGame,
) {
  if (isNotStartedGame(game)) {
    game.connect(connection);
    await game.sleepUntilCanBecomeReady();
    transformToStartedGameIfNeeded(store, game.id, makeStartedGame);
  }
  return requireStartedGame(store, game.id);
}

function transformToStartedGameIfNeeded(
  store: DurakGamesStore,
  gameId: string,
  makeStartedGame: (nonStarted: NonStartedDurakGame) => DurakGame,
) {
  const gameInStore = store.require(gameId);
  if (isStartedGame(gameInStore)) {
    return;
  } else if (!isNotStartedGame(gameInStore)) {
    throw new Error("Unknown game type in game store, wanted 'non started'");
  }
  store.set(makeStartedGame(gameInStore));
}

function requireStartedGame(store: DurakGamesStore, gameId: string) {
  const game = store.require(gameId);
  if (isStartedGame(game)) {
    return game;
  }
  throw new Error(`Failed to get started game with id="${gameId}"`);
}
