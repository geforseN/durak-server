import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import EntityStore from "@/utils/entity-store.js";

export const durakGamesStore = new EntityStore<
  DurakGame | NonStartedDurakGame
>('Some Durak Game');

export type DurakGamesStore = typeof durakGamesStore;

export default durakGamesStore;
