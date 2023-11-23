import DurakGamesStore from "../DurakGamesStore.js";

export const durakGamesStore = new DurakGamesStore();

declare global {
  // eslint-disable-next-line no-var
  var durakGamesStore: DurakGamesStore;
}

globalThis.durakGamesStore = durakGamesStore;

export default durakGamesStore;
