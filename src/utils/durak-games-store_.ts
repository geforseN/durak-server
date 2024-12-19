import type { DurakGameSocket } from "@durak-game/durak-dts";

import assert from "node:assert";

import type Lobby from "@/module/Lobbies/entity/Lobby.js";

import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import {
  ResolveStartedGameContext,
  type ResolvedGameContext,
} from "@/modules/durak-game/resolve-started-game-context.js";

export default class DurakGamesStore<
  Game extends DurakGame | NonStartedDurakGame =
    | DurakGame
    | NonStartedDurakGame,
> {
  values: Map<Game["info"]["id"], DurakGame | NonStartedDurakGame>;

  constructor() {
    this.values = new Map();
  }

  getGameWithId(gameId: Game["info"]["id"]) {
    return this.values.get(gameId);
  }

  hasGameWithId(gameId: Game["info"]["id"]) {
    return this.values.has(gameId);
  }

  removeStartedGame(game: DurakGame) {
    const isExisted = this.values.delete(game.info.id);
    assert.ok(isExisted);
  }

  updateLobbyToNonStartedGame(lobby: Lobby) {
    this.values.set(lobby.id, new NonStartedDurakGame(lobby, this));
  }

  async resolveStartedGame(
    gameId: string,
    playerId: string,
  ): Promise<ResolvedGameContext> {
    const game = this.getGameWithId(gameId);
    assert.ok(game, `Unknown game with id = ${gameId}`);
    // prettier-ignore
    const resolveGameContext = new ResolveStartedGameContext(
      game,
      (gameId) => this.values.get(gameId),
    );
    return await resolveGameContext.execute(playerId);
  }

  updateNonStartedGameToStarted(
    nonStartedGame: NonStartedDurakGame,
    namespace: DurakGameSocket.Namespace,
  ) {
    assert.ok(nonStartedGame && nonStartedGame.info.status === "non started");
    const startedGame = new DurakGame(nonStartedGame, namespace);
    this.values.set(startedGame.info.id, startedGame);
    nonStartedGame.emitEverySocketWithStartedGameDetails(startedGame);
    return startedGame;
  }

  get startedGamesState() {
    return [...this.values.values()]
      .filter((game): game is DurakGame =>
        ["started", "starts"].includes(game.info.status),
      )
      .map((game) => ({
        info: {
          adminId: game.info.adminId,
          id: game.info.id,
          status: game.info.status,
        },
        players: [...game.players].map((player) => player.toJSON()),
        settings: game.settings,
      }));
  }
}
