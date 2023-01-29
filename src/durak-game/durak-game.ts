import { GameSettings } from "../namespaces/lobbies/lobbies.types";
import Lobby from "../namespaces/lobbies/entity/lobby";
import CardPlayers from "./entity/card-players";
import Discard from "./entity/Deck/Discard";
import Talon from "./entity/Deck/Talon";
import CardPlayer from "./entity/card-player";

const CARD_COUNT = 6;

export default class DurakGame {
  id: string;
  settings: GameSettings;
  players: CardPlayers;
  talon: Talon;
  discard: Discard;

  constructor({ id, settings, users }: Lobby) {
    this.id = id;
    this.settings = settings;
    this.players = new CardPlayers(users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
  }

  handleFirstDistribution(player: CardPlayer) {
    const cards = this.talon.drawCardsFromTop(CARD_COUNT);
    player.receiveCards(...cards);
  }
}