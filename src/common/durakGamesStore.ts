import DurakGamesStore from "../DurakGamesStore.js";

export const durakGamesStore = new DurakGamesStore();

globalThis.durakGamesStore = durakGamesStore;

export default durakGamesStore;
