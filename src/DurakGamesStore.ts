import type { DurakGameSocket } from "@durak-game/durak-dts";
import assert from "node:assert";
import DurakGame from "./module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "./module/DurakGame/NonStartedDurakGame.js";
import type Lobby from "./module/Lobbies/entity/Lobby.js";

export default class DurakGamesStore<
  Game extends NonStartedDurakGame | DurakGame = NonStartedDurakGame | DurakGame,
> {
  values: Map<Game["info"]["id"], NonStartedDurakGame | DurakGame>;

  constructor() {
    this.values = new Map();
  }

  get startedGamesState() {
    return [...this.values.values()]
      .filter((game): game is DurakGame => game.info.status !== "ended")
      .map((game) => ({
        ...game,
        players: [...game.players].map((player) => player.toJSON()),
      }));
  }

  hasGameWithId(gameId: Game["info"]["id"]) {
    return this.values.has(gameId);
  }

  getGameWithId(gameId: Game["info"]["id"]) {
    return this.values.get(gameId);
  }

  updateLobbyToNonStartedGame(lobby: Lobby) {
    this.values.set(lobby.id, new NonStartedDurakGame(lobby));
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

  removeStartedGame(game: DurakGame) {
    const isExisted = this.values.delete(game.info.id);
    assert.ok(isExisted);
  }
}
