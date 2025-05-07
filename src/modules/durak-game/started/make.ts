import { Players } from "@/module/DurakGame/entity/index.js";
import type NonStartedDurakGame from "@/modules/durak-game/non-started/NonStartedDurakGame.js";
import StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";

export function makeStartedGame(nonStarted: NonStartedDurakGame) {
  return new StartedDurakGame(
    nonStarted.id,
    new Players([]),
    nonStarted.setting,
  );
}
