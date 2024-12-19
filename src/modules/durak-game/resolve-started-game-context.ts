import assert from "node:assert";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import type { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import { RetryInterval } from "@/utils/retry-interval.js";

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
    const interval = new RetryInterval<ResolvedGameContext>(
      (resolve, context) => {
        const game = this.getGame(nonStartedGameId);
        if (game instanceof DurakGame) {
          const self = game.players.get((player) => player.id === playerId);
          return resolve(this.#make(game, self, context.attemptCounter.value));
        }
      },
      () => new Error("Game is not started, too many attempts"),
      intervalOptions,
    );
    return await interval.execute();
  }
}
