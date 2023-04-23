import assert from "node:assert";
import { durakGames } from "../index";
import { GameSettings } from "../namespaces/lobbies/lobbies.types";
import { GamesIO } from "../namespaces/games/games.types";
import { GameService } from "../namespaces/games/game.service";
import Lobby from "../namespaces/lobbies/entity/lobby";
import Players from "./entity/Players/Players";
import Discard from "./entity/Deck/Discard";
import Talon from "./entity/Deck/Talon";
import Desk from "./entity/Desk";
import GameRound from "./entity/GameRound";
import Player from "./entity/Players/Player";
import GamePlayersManagerService from "./entity/Services/PlayersManager.service";
import GameDeskService from "./entity/Services/Desk.service";
import GameTalonService from "./entity/Services/Talon.service";
import Card from "./entity/Card";
import GameDiscardService from "./entity/Services/Discard.service";


export default class DurakGame {
  info: { id: string, adminAccname?: string, namespace?: GamesIO.NamespaceIO };
  settings: GameSettings;
  players: Players;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  service?: GameService;
  round!: GameRound;

  constructor({ id, settings, users, adminAccname }: Lobby) {
    this.info = { id, adminAccname };
    this.settings = settings;
    this.players = new Players(users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }

  start(socketsNamespace: GamesIO.NamespaceIO) {
    const { talon } = this;
    this.injectServices(socketsNamespace);
    this.players.receiveFirstCards({ talon, cardCount: 6, pushCount: 1 });
    this.makeInitialSuperPlayers();
    this.makeNewRound({ number: 1 });
  }

  handleLostDefence(defender = this.players.defender): void {
    this.desk.provideCards(defender);
    this.service?.lostRound({ game: this });
    return this.handleNewRound({ nextAttacker: defender.left });
  }

  handleWonDefence(defender = this.players.defender): void {
    this.desk.provideCards(this.discard);
    this.service?.wonRound({ game: this });
    return this.handleNewRound({ nextAttacker: defender });
  }

  private handleNewRound({ nextAttacker }: { nextAttacker: Player }) {
    if (this.talon.hasCards) this.makeCardDistribution();
    else this.players.manager.removeEmptyPlayers();
    if (this.players.count === 1) this.end();
    this.players.manager.makeNewSuperPlayers({ nextAttacker });
    this.makeNewRound();
  }

  private makeCardDistribution() {
    for (const id of this.round.distributionQueue.map((player) => player.id)) {
      if (this.talon.isEmpty) return;
      this.talon.provideCards(
        this.players.getPlayer({ id }),
      );
    }
  }

  private makeNewRound({ number } = { number: this.round.number + 1 }) {
    const { desk, info: { namespace }, players: { attacker } } = this;
    if (!namespace) throw new Error("Socket namespace not found");
    this.round = new GameRound({ number, attacker, desk, namespace });
  }

  private end() {
    setTimeout(() => {
      this.service?.end(this);
      durakGames.delete(this.info.id);
      // TODO SAVE GAME IN DATABASE
    }, 10_000);
  }

  private makeInitialSuperPlayers() {
    assert.ok(this.info.adminAccname, "Admin accname not found");
    const desiredAttacker = this.players.getPlayer({ id: this.info.adminAccname });
    const attacker = this.players.manager.makeAttacker(desiredAttacker);
    const defender = this.players.manager.makeDefender(attacker.left);
    return { attacker, defender };
  }

  private injectServices(socketsNamespace: GamesIO.NamespaceIO) {
    this.info.namespace = socketsNamespace;
    this.service = new GameService(this.info.namespace);
    this.desk.injectService(new GameDeskService(this.info.namespace));
    this.talon.injectService(new GameTalonService(this.info.namespace));
    this.players.manager.injectService(new GamePlayersManagerService(this.info.namespace));
    this.discard.injectService(new GameDiscardService(this.info.namespace));
  }
}

export interface CanReceiveCards {
  receiveCards: (...cards: Card[]) => void;
}

export interface CanProvideCards<Target> {
  provideCards: (target: Target) => void;
}
