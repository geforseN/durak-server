import assert from "node:assert";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import type { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

export type ResolvedGameContext = {
  startedGame: ReturnType<DurakGame["toGameJSON"]>;
  attempt: number;
  self: ReturnType<BasePlayer["toGameJSON"]>["self"];
  enemies: ReturnType<BasePlayer["toGameJSON"]>["enemies"];
};

export class ResolveStartedGameContext {
  constructor(
    readonly game: DurakGame | NonStartedDurakGame,
    readonly getGame: (
      gameId: string,
    ) => NonStartedDurakGame | DurakGame | undefined,
  ) {}

  #make(game: DurakGame, player: BasePlayer, attempt = 0): ResolvedGameContext {
    return {
      startedGame: game.toGameJSON(),
      attempt,
      ...player.toGameJSON(),
    };
  }

  async execute(playerId: string): Promise<ResolvedGameContext> {
    const game = this.game;
    if (game instanceof DurakGame) {
      const player = game.players.get((player) => player.id === playerId);
      return this.#make(game, player);
    }
    if (game instanceof NonStartedDurakGame) {
      const player = game.usersInfo.find((user) => user.id === playerId);
      assert.ok(player, new Error("Unauthorized"));
      return await this.#waitBeforeGameStarts(game.info.id, player.id, {
        attempts: 10,
        period: 1000,
      });
    }
    throw new Error("Unknown game type");
  }

  async #waitBeforeGameStarts(
    nonStartedGameId: string,
    playerId: string,
    intervalOptions: {
      attempts: number;
      period: number;
    },
  ) {
    const nonStartedGame = this.getGame(nonStartedGameId);
    assert.ok(nonStartedGame, "Such non-started game does not exist");
    assert.ok(
      nonStartedGame instanceof NonStartedDurakGame,
      'Game is not "non started"',
    );
    const interval = {
      timeout: undefined as NodeJS.Timeout | undefined,
      attemptCounter: {
        value: 0,
        increment() {
          this.value++;
        },
      },
      ...intervalOptions,
      hasToManyAttempts() {
        return this.attemptCounter.value >= this.attempts;
      },
      cleanup() {
        clearInterval(this.timeout);
      },
      async start<T>(tryResolve: (resolve: (value: T) => void) => void) {
        try {
          return await new Promise<T>((resolve, reject) => {
            interval.timeout = setInterval(() => {
              interval.attemptCounter.increment();
              tryResolve(resolve);
              if (interval.hasToManyAttempts()) {
                return reject();
              }
            }, interval.attempts);
          });
        } finally {
          interval.cleanup();
        }
      },
    };
    return await interval
      .start<ResolvedGameContext>((resolve) => {
        const game = this.getGame(nonStartedGameId);
        if (game instanceof DurakGame) {
          const self = game.players.get((player) => player.id === playerId);
          return resolve(this.#make(game, self, interval.attemptCounter.value));
        }
      })
      .catch(() => {
        throw new Error("Game is not started, too many attempts");
      });
  }
}
