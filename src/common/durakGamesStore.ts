import DurakGame from "@/module/DurakGame/DurakGame.js";
import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import MapEntityStore from "@/utils/map-entity-store.js";
import { MapEntityStores } from "@/utils/map-entity-stores.js";

const startedGamesStore = new MapEntityStore<DurakGame>("Started Durak Game");

const nonStartedGamesStore = new MapEntityStore<NonStartedDurakGame>(
  "Non-started Durak Game",
);

export const durakGamesStore = MapEntityStores.create([
  {
    For: NonStartedDurakGame,
    store: nonStartedGamesStore,
  },
  {
    For: DurakGame,
    store: startedGamesStore,
  },
] as const);

export type DurakGamesStore = typeof durakGamesStore;

export default durakGamesStore;
