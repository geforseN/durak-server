import type { Game } from "@/modules/durak-game/types.js";
import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";

export function isStartedGame(game: Game) {
  return game instanceof DurakGame;
}

export function isNotStartedGame(game: Game) {
  return game instanceof NonStartedDurakGame;
}
