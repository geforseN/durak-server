import assert from "node:assert";
import { DurakGameSocket } from "./socket/DurakGameSocket.types";
import {
  Discard,
  Desk,
  GameRound,
  Talon,
  Card,
  Players,
  AllowedMissingCardCount,
} from "./entity";
import DurakGameService from "./DurakGame.service";
import {
  GamePlayersManagerService,
  GamePlayerService,
  GameDeskService,
  GameTalonService,
  GameDiscardService,
} from "./socket/service";
import Lobby from "../Lobbies/entity/Lobby";
import { GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import GameRoundDistributionQueue from "./GameRoundDistributionQueue";

export default class DurakGame {
  info: {
    id: string;
    adminId: string;
    durakId?: string;
    namespace?: DurakGameSocket.Namespace;
  };
  settings: GameSettings;
  players: Players;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  service?: DurakGameService;
  round!: GameRound;

  constructor({ id, settings, slots }: Lobby) {
    this.info = { id, adminId: slots.admin.id };
    this.settings = { ...settings, moveTime: 90_000 };
    this.players = new Players(slots.users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }

  start(socketsNamespace: DurakGameSocket.Namespace) {
    this.injectServices(socketsNamespace);
    this.talon.makeInitialDistribution(this.players, {
      finalCardCount: 6,
      cardCountPerIteration: 2,
    });
    this.makeInitialSuperPlayers();
    this.makeNewRound({ number: 1 });
  }

  handleLostDefence(defender = this.players.defender): void {
    this.desk.provideCards(defender);
    this.service?.lostRound({ game: this });
    if (this.talon.hasCards) {
      // TODO new GameRoundDistributionQueue(this).makeDistribution()
      this.#makeCardDistribution();
    } else {
      this.players.manager.removeEmptyPlayers();
    }
    if (this.players.count === 1) {
      return this.end();
    }
    const attacker = this.players.manager.makeNewAttacker(defender.left);
    this.players.manager.makeNewDefender(attacker.left);
    this.makeNewRound();
  }

  handleWonDefence(defender = this.players.defender): void {
    this.desk.provideCards(this.discard);
    this.service?.wonRound({ game: this });
    if (this.talon.hasCards) {
      this.#makeCardDistribution();
    } else {
      this.players.manager.removeEmptyPlayers();
    }
    if (this.players.count === 1) {
      return this.end();
    }
    const attacker = this.players.manager.makeNewAttacker(defender);
    this.players.manager.makeDefender(attacker.left);
    this.makeNewRound();
  }

  #makeCardDistribution() {
    // TODO: remove below mapping if assert will never called
    const distributionQueue = new GameRoundDistributionQueue(this)
      .makeDistribution()
      .map((distributionPlayer) => {
        const player = this.players.getPlayer({ id: distributionPlayer.id });
        console.assert(
          distributionPlayer === player,
          "DISTRIBUTION %s QUEUE",
          player.id,
        );
        return player;
      });
    for (const player of distributionQueue) {
      if (this.talon.isEmpty) return;
      this.talon.provideCards(player);
    }
  }

  private makeNewRound({ number = this.round.number + 1 } = {}) {
    this.round = new GameRound({ number, game: this });
  }

  private end() {
    this.info.durakId = this.players.__value[0].id;
    this.service?.end(this);
  }

  private makeInitialSuperPlayers() {
    assert.ok(this.info.adminId, "Admin accname not found");
    const desiredAttacker = this.players.getPlayer({ id: this.info.adminId });
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
    this.players.manager.injectService(
      new GamePlayersManagerService(this.info.namespace),
    );
    this.discard.injectService(new GameDiscardService(this.info.namespace));
  }
}

export interface CanReceiveCards {
  receiveCards: (...cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (target: Target) => void;
}
