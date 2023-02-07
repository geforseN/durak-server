import { GameSettings } from "../namespaces/lobbies/lobbies.types";
import Lobby from "../namespaces/lobbies/entity/lobby";
import CardPlayers from "./entity/card-players";
import Discard from "./entity/Deck/Discard";
import Talon from "./entity/Deck/Talon";
import CardPlayer from "./entity/card-player";
import Desk from "./entity/Desk";
import { LobbyUserIdentifier } from "../namespaces/lobbies/entity/lobby-users";
import { clearTimeout } from "node:timers";
import { GamesService } from "../namespaces/games/games.service";
import { GameState } from "../namespaces/games/games.types";


export type GameStat = { roundNumber: number };
export type GameInfo = { id: string, adminAccname: string | null }
const ROUND_TIME = 20_000;

export default class DurakGame {
  info: GameInfo;
  stat: GameStat;
  settings: GameSettings;
  players: CardPlayers;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  cardDistributionQueue: CardPlayer[] = [];
  gameService: GamesService;

  constructor({ id, settings, users, adminAccname }: Lobby) {
    this.info = { id, adminAccname };
    this.settings = settings;
    this.stat = { roundNumber: 0 };
    this.players = new CardPlayers(users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
    this.gameService = new GamesService(id);
  }

  async initialize() {
    this.makeFirstDistributionByOne();
    const { attacker, defender } = this.findInitialDefenderAndAttacker();
    this.cardDistributionQueue.push(defender, attacker);

    // ALSO makeEmits who is attacker and defender ALSO update roles & statuses in instances
    this.gameService.revealAttackUI({ accname: attacker.info.accname });
    // ALSO add accname in queue in which shown who can put cards
    const transitIntoDefence = () => {
      this.gameService.hideAttackUI({ accname: attacker.info.accname });
      this.gameService.revealDefenderUI({ accname: defender.info.accname });

    };
    const handleDefense = () => {
      this.gameService.hideAttackUI({ accname: attacker.info.accname });
      this.gameService.revealDefenderUI({ accname: defender.info.accname });
      // ALSO makeEmits who is statuses ALSO update statuses in instances

      const t = setTimeout(dissalowedToPutCards, ROUND_TIME);
      // on timeout remove from queue allowedPutCard
      // timeout this
      defenderSocket.on("putCardOnDesk", tryDefendCardDesk);
    };

    const handleAttack = () => {
      this.gameNamespace.to(defender.info.accname).emit("showDefenderUI", false);
      this.gameNamespace.to(attacker.info.accname).emit("showAttackerUI", true);
      attacker.status = "ATTACKING";
      defender.status = "WAITING";
    };

    // ЛИБО по окончанию интервала даем право защиты
    const handleDefenseTimeout = setTimeout(handleDefense, ROUND_TIME);
    // ЛИБО по нажатию кнопки заверешения раунда от атакующего
    attackerSocket.on("attackEnd", () => {
      clearTimeout(handleDefenseTimeout);
      handleDefense();
    });

    on("successfullyDefended", () => {
      this.discard.push(...this.desk.cards);
      this.desk.clear();

      defender.role = "ATTACKER";
      defender.status = "ATTACKING";
      defender.left!.role = "DEFENDER";
      defender.left!.status = "WAITING";
    });

    on("takeCardsFromDesk", () => {
      defender.hand.receiveCards(...this.desk.values());
      this.desk.clear();

      attacker.role = "NONE";
      defender.role = "NONE";
      attacker.status = "NONE";
      defender.status = "NONE";

      defender.left!.role = "ATTACKER";
      defender.left!.status = "ATTACKING";
      defender.left!.left!.role = "DEFENDER";
      defender.left!.left!.status = "WAITING";
    });


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
  }

  private findInitialDefenderAndAttacker(): { attacker: CardPlayer, defender: CardPlayer } {
    const attacker = this.players.getPlayer({ accname: this.info.adminAccname }).makeAttacker();
    const defender = attacker.left!.makeDefender();
    return { attacker, defender };
  }

  loop() {

  }

  restoreState({ accname }: LobbyUserIdentifier): GameState {
    const self = this.players.getSelf({ accname })!;
    const enemies = this.players.getEnemies({ accname });
    const desk = this.desk.slots;
    return { self, enemies, desk };
  }

  makeFirstDistributionByOne() {
    const cardCount = this.players.count * 6;
    const cards = this.talon.shuffle().popCards(cardCount);
    this.players.receiveCardsByOne(cards);
  }
}


export function isDefender(player: Player): player is Defender {
  return player instanceof Defender;
}

export function isAttacker(player: Player): player is Attacker {
  return player instanceof Attacker;
}

export function makeDefender({ playerIndex, players }: { playerIndex: number, players: Player[] }) {
  const player = players[playerIndex];
  players[playerIndex] = new Defender(player);
}

export function makeAttacker({ playerIndex, players }: { playerIndex: number, players: Player[] }) {
  const player = players[playerIndex];
  players[playerIndex] = new Attacker(player);
}

export function makePlayer({ playerIndex, players }: { playerIndex: number, players: Player[] }) {
  const player = players[playerIndex];
  players[playerIndex] = new Player(player);
}