import { GameSettings } from "../namespaces/lobbies/lobbies.types";
import Lobby from "../namespaces/lobbies/entity/lobby";
import Players from "./entity/Players/Players";
import Discard from "./entity/Deck/Discard";
import Talon from "./entity/Deck/Talon";
import Desk from "./entity/Desk";
import { LobbyUserIdentifier } from "../namespaces/lobbies/entity/lobby-users";
import { GameSocket, GameService } from "../namespaces/games/game.service";
import { GamesIO, GameState } from "../namespaces/games/games.types";
import Card from "./entity/Card";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";
import Player, { CardRemove } from "./entity/Players/Player";

export type GameStat = { roundNumber: number };
export type GameInfo = { id: string, adminAccname: string | null };

export default class DurakGame {
  info: GameInfo;
  stat: GameStat;
  settings: GameSettings;
  players: Players;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  service!: GameService;

  constructor({ id, settings, users, adminAccname }: Lobby) {
    this.info = { id, adminAccname };
    this.settings = settings;
    this.stat = { roundNumber: 0 }; // new GameStat
    this.players = new Players(users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }

  start(namespace: GamesIO.NamespaceIO) {
    this.service = new GameService(namespace);
    this.makeFirstDistributionByOne();
    this.stat.roundNumber++;
    const { attacker, defender } = this.makeInitialDefenderAndAttacker();
    this.service.revealAttackUI({ accname: attacker.info.accname });
    this.service.revealDefendUI({ accname: defender.info.accname });
  }

  insertAttackCardOnDesk({ card, index, socket }: { card: Card, index: number } & GameSocket): void {
    this.desk.insertAttackerCard({ index, card });
    this.service.insertAttackCard({ index, card, socket });
  }

  insertDefendCardOnDesk({ card, index, socket }: { card: Card, index: number } & GameSocket): void {
    this.desk.insertDefenderCard({ index, card });
    this.service.insertDefendCard({ index, card, socket });
  }

  removeCard({ player, socket, card }: { player: Player & CardRemove, card: Card } & GameSocket) {
    const { info: { accname } } = player;
    player.removeCard(card);
    this.service.removeCard({ accname, card, socket });
    this.service.changeCardCount({ accname, socket, cardCount: player.hand.count });
  }

  // делаем интервал
  // даем возможность кидать карты
  // при конце хода очищаем интервал и
  // выдаем право хода защищающемуся

  // защищающийся пытается отбится
  //
  // при успешной защите можно:
  // - ЛИБО повторить заход атаки
  //   - спросить у первого атаковавшего
  //   - если не может кинуть карты, то спрашиваем остальных слева
  // - ЛИБО перевести карты в биту
  //
  // при провале:
  // - неотбившийся забирает карты
  // - ход достается левому от проигравшего

  restoreState({ accname }: LobbyUserIdentifier): GameState {
    // return new GameState({ accname });
    const self = this.players.getSelf({ accname });
    const enemies = this.players.getEnemies({ accname });
    const desk = this.desk.slots;
    return { self, enemies, desk };
  }

  private makeFirstDistributionByOne() {
    const cardCount = this.players.count * 6;
    const cards = this.talon.shuffle().popCards(cardCount);
    this.players.receiveCardsByOne(cards);
  }

  private makeInitialDefenderAndAttacker(): { attacker: Attacker, defender: Defender } {
    const attacker = this.players.makeAttacker({ accname: this.info.adminAccname! });
    const defender = this.players.makeDefender({ accname: attacker.left.info.accname });
    return { attacker, defender };
  }
}
