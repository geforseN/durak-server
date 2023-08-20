import DurakGame from "./module/DurakGame/DurakGame";
import NonStartedDurakGame from "./module/DurakGame/NonStartedDurakGame";
import assert from "node:assert";
import { DurakGameSocket } from "./module/DurakGame/socket/DurakGameSocket.types";
import Lobby from "./module/Lobbies/entity/Lobby";

export default class DurakGamesStore<
  Game extends NonStartedDurakGame | DurakGame,
> {
  values: Map<Game["info"]["id"], NonStartedDurakGame | DurakGame>;

  constructor() {
    this.values = new Map();
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
    assert.ok(nonStartedGame && !nonStartedGame.isStarted);
    const startedGame = new DurakGame(nonStartedGame, namespace);
    this.values.set(startedGame.info.id, startedGame);
    nonStartedGame.emitEverySocketWithStartedGameDetails(startedGame);
    return startedGame;
  }

  endStartedGame(game: DurakGame) {
    this.values.delete(game.info.id);
  }

  removeStartedGame(game: DurakGame) {
    const isExisted = this.values.delete(game.info.id);
    assert.ok(isExisted);
  }
}
