import StartedDurakGame from "@/modules/durak-game/started/StartedDurakGame.js";
import NonStartedDurakGame from "@/modules/durak-game/non-started/NonStartedDurakGame.js";
import MapEntityStore from "@/utils/map-entity-store.js";
import { MapEntityStores } from "@/utils/map-entity-stores.js";

const startedGamesStore = new MapEntityStore<StartedDurakGame>("Started Durak Game");

const nonStartedGamesStore = new MapEntityStore<NonStartedDurakGame>(
  "Non-started Durak Game",
);

export const durakGamesStore = MapEntityStores.create([
  // NOTE: order does matter, StartedDurakGame must be before NonStartedDurakGame, otherwise set will not work
  // if EndedDurakGame will be here than must make it first
  {
    For: StartedDurakGame,
    store: startedGamesStore,
  },
  {
    For: NonStartedDurakGame,
    store: nonStartedGamesStore,
  },
] as const);

export type DurakGamesStore = typeof durakGamesStore;

export default durakGamesStore;
