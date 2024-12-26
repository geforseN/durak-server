import type { DurakGameSocket } from "@durak-game/durak-dts";

import assert from "node:assert";

import type Lobby from "@/module/Lobbies/entity/Lobby.js";

import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";

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
