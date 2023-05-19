import assert from "node:assert";
import { DurakGameSocket } from "./socket/DurakGameSocket.types";
import { GameSettings } from "../../namespaces/lobbies/lobbies.types";
import Lobby from "../../namespaces/lobbies/entity/lobby";
import { Discard, Desk, GameRound, Talon, Card, Players, AllowedMissingCardCount } from "./entity";
import DurakGameService from "./DurakGame.service";
import {
  GamePlayersManagerService,
  GamePlayerService,
  GameDeskService,
  GameTalonService,
  GameDiscardService,
} from "./socket/service";


export default class DurakGame {
  info: { id: string, adminAccname?: string, namespace?: DurakGameSocket.Namespace };
  settings: GameSettings;
  players: Players;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  service?: DurakGameService;
  round!: GameRound;

  constructor({ id, settings, users, adminAccname }: Lobby) {
    this.info = { id, adminAccname };
    this.settings = settings;
    this.players = new Players(users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }

  start(socketsNamespace: DurakGameSocket.Namespace) {
    this.injectServices(socketsNamespace);
    this.makeInitialDistribution({ finalCardCount: 6, cardCountPerIteration: 2 });
    this.makeInitialSuperPlayers();
    this.makeNewRound({ number: 1 });
  }

  handleLostDefence(defender = this.players.defender): void {
    this.desk.provideCards(defender);
    this.service?.lostRound({ game: this });
    this.handleCanContinue();
    const attacker = this.players.manager.makeNewAttacker(defender.left);
    this.players.manager.makeNewDefender(attacker.left);
    this.makeNewRound();
  }

  handleWonDefence(defender = this.players.defender): void {
    this.desk.provideCards(this.discard);
    this.service?.wonRound({ game: this });
    this.handleCanContinue();
    const attacker = this.players.manager.makeNewAttacker(defender);
    this.players.manager.makeDefender(attacker.left);
    this.makeNewRound();
  }

  private handleCanContinue() {
    if (this.talon.hasCards) this.makeCardDistribution();
    else this.players.manager.removeEmptyPlayers();
    if (this.players.count === 1) this.end();
  }

  private makeCardDistribution() {
    const distributionQueue = this.round.distributionQueue
      .map((distributionPlayer) => {
        const player = this.players.getPlayer({ id: distributionPlayer.id });
        console.assert(distributionPlayer === player, "DISTRIBUTION %s QUEUE", player.id);
        return player;
      });
    for (const player of distributionQueue) {
      if (this.talon.isEmpty) return;
      this.talon.provideCards(player);
    }
  }

  private makeNewRound({ number } = { number: this.round.number + 1 }) {
    this.round = new GameRound({ number, game: this });
  }

  private end() {
    this.service?.end(this);
  }

  private makeInitialDistribution(distributionOptions: { finalCardCount: AllowedMissingCardCount, cardCountPerIteration: AllowedMissingCardCount }) {
    this.talon.makeInitialDistribution(this.players, distributionOptions);
  }

  private makeInitialSuperPlayers() {
    assert.ok(this.info.adminAccname, "Admin accname not found");
    const desiredAttacker = this.players.getPlayer({ id: this.info.adminAccname });
    const attacker = this.players.manager.makeAttacker(desiredAttacker);
    const defender = this.players.manager.makeDefender(attacker.left);
    return { attacker, defender };
  }

  private injectServices(socketsNamespace: DurakGameSocket.Namespace) {
    this.info.namespace = socketsNamespace;
    this.service = new DurakGameService(this.info.namespace);
    this.desk.injectService(new GameDeskService(this.info.namespace));
    this.talon.injectService(new GameTalonService(this.info.namespace));
    this.players.injectService(new GamePlayerService(this.info.namespace));
    this.players.manager.injectService(new GamePlayersManagerService(this.info.namespace));
    this.discard.injectService(new GameDiscardService(this.info.namespace));
  }
}

export interface CanReceiveCards {
  receiveCards: (...cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (target: Target) => void;
}
