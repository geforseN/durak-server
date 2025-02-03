import type StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";
import type NonStartedDurakGame from "@/modules/durak-game/non-started/NonStartedDurakGame.js";

export type Game = NonStartedDurakGame | StartedDurakGame;
