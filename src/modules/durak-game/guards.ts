import type { Game } from "@/modules/durak-game/types.js";
import StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";
import NonStartedDurakGame from "@/modules/durak-game/non-started/NonStartedDurakGame.js";

export function isStartedGame(game: Game) {
  return game instanceof StartedDurakGame;
}

export function isNotStartedGame(game: Game) {
  return game instanceof NonStartedDurakGame;
}
