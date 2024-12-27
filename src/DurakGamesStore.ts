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

  get(gameId: Game["info"]["id"]) {
    return this.values.get(gameId);
  }

  set(gameId: Game["info"]["id"], game: DurakGame | NonStartedDurakGame) {
    this.values.set(gameId, game);
  }
}
