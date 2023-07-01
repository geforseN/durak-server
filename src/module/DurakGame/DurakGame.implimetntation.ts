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
    durakPlayerId?: string;
    namespace?: DurakGameSocket.Namespace;
  };
  settings: GameSettings & {
    initialDistribution: {
      finalCardCount: AllowedMissingCardCount;
      cardCountPerIteration: AllowedMissingCardCount;
    };
  };
  players: Players;
  talon: Talon;
  discard: Discard;
  desk: Desk;
  service?: DurakGameService;
  round!: GameRound;

  constructor({ id, settings, slots }: Lobby) {
    this.info = { id, adminId: slots.admin.id };
    this.settings = {
      ...settings,
      moveTime: 90_000,
      initialDistribution: {
        finalCardCount: 6,
        cardCountPerIteration: 2,
      },
    };
    this.players = new Players(slots.users);
    this.talon = new Talon(settings.cardCount);
    this.discard = new Discard();
    this.desk = new Desk();
  }

  start(socketsNamespace: DurakGameSocket.Namespace) {
    this.#injectServices(socketsNamespace);
    new GameRoundDistributionQueue(this).makeInitialDistribution();
    this.#makeInitialSuperPlayers();
    this.round = new GameRound(this);
  }

  handleLostDefence(defender = this.players.defender): void {
    this.desk.provideCards(defender);
    this.service?.lostRound({ game: this });
    this.#beforeNewRoundHandler();
    if (this.players.count === 1) {
      return this.#end();
    }
    const attacker = this.players.manager.makeNewAttacker(defender.left);
    this.players.manager.makeNewDefender(attacker.left);
    this.round = new GameRound(this);
  }

  handleWonDefence(defender = this.players.defender): void {
    this.desk.provideCards(this.discard);
    this.service?.wonRound({ game: this });
    this.#beforeNewRoundHandler();
    if (this.players.count === 1) {
      return this.#end();
    }
    const attacker = this.players.manager.makeNewAttacker(defender);
    this.players.manager.makeDefender(attacker.left);
    this.round = new GameRound(this);
  }

  #end() {
    this.info.durakPlayerId = [...this.players][0].id;
    this.service?.end(this);
  }

  #beforeNewRoundHandler() {
    if (this.talon.hasCards) {
      new GameRoundDistributionQueue(this).makeDistribution();
    } else {
      this.players = new Players(this.players)
    }
  }

  #makeInitialSuperPlayers() {
    assert.ok(this.info.adminId, "Admin accname not found");
    const desiredAttacker = this.players.getPlayer({ id: this.info.adminId });
    const attacker = this.players.manager.makeAttacker(desiredAttacker);
    const defender = this.players.manager.makeDefender(attacker.left);
    return { attacker, defender };
  }

  #injectServices(socketsNamespace: DurakGameSocket.Namespace) {
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
