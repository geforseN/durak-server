import assert from "node:assert";
import { DurakGameSocket } from "./socket/DurakGameSocket.types";
import { Discard, Desk, GameRound, Talon, Card, Players } from "./entity";
import DurakGameService from "./DurakGame.service";
import {
  GamePlayerWebsocketService,
  GameDeskWebsocketService,
  GameTalonWebsocketService,
  GameDiscardWebsocketService,
} from "./socket/service";
import { GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import GameRoundDistributionQueue from "./GameRoundDistributionQueue";
import { UnstartedGame } from "./NonstartedDurakGame";
import GameRoundService from "./entity/GameRound/GameRound.service";

export default class DurakGame {
  readonly info: {
    id: string;
    adminId: string;
    namespace: DurakGameSocket.Namespace;
    durakPlayerId?: string;
    isStarted: true;
  };
  readonly settings: GameSettings;
  readonly talon: Talon;
  readonly discard: Discard;
  readonly desk: Desk;
  readonly #wsService: DurakGameService;
  players: Players;
  round: GameRound;

  constructor(game: UnstartedGame, namespace: DurakGameSocket.Namespace) {
    this.info = { ...game.info, namespace, isStarted: true };
    this.settings = { ...game.settings, moveTime: 90_000 };
    this.players = new Players(
      game.players,
      new GamePlayerWebsocketService(namespace),
    );
    this.talon = new Talon(game.settings, new GameTalonWebsocketService(namespace));
    this.discard = new Discard(new GameDiscardWebsocketService(namespace));
    this.desk = new Desk(game.settings.desk, new GameDeskWebsocketService(namespace));
    this.#wsService = new DurakGameService(namespace);
    // TODO change code line below
    // NOTE should be similar to => readonly this.distribution = new GameRoundDistribution(this);
    new GameRoundDistributionQueue(this).makeInitialDistribution();
    this.#makeInitialSuperPlayersStrategy();
    this.round = new GameRound(this, new GameRoundService(namespace));
  }

  handleLostDefence(): void {
    this.desk.provideCards(this.players.defender);
    this.#wsService.lostRound(this);
    try {
      this.#prepareBeforeNewRound();
    } catch {
      return this.#end();
    }
    this.players.attacker = this.players.defender.left;
    this.players.defender = this.players.attacker.left;
    this.round = new GameRound(this);
  }

  handleWonDefence(): void {
    this.desk.provideCards(this.discard);
    this.#wsService.wonRound(this);
    try {
      this.#prepareBeforeNewRound();
    } catch {
      return this.#end();
    }
    this.players.attacker = this.players.defender;
    this.players.defender = this.players.attacker.left;
    this.round = new GameRound(this);
  }

  restoreState(socket: DurakGameSocket.Socket) {
    this.#wsService.restoreState({ socket, game: this });
  }

  #prepareBeforeNewRound() {
    if (this.talon.hasCards) {
      // TODO change code line below  
      // NOTE should be similar to => this.distribution.make()
      new GameRoundDistributionQueue(this).makeDistribution();
    } else {
      this.players = new Players(this.players);
      assert.ok(this.players.count !== 1);
    }
  }

  #end() {
    this.info.durakPlayerId = [...this.players][0].id;
    this.#wsService?.end(this);
  }

  #makeInitialSuperPlayersStrategy() {
    assert.ok(this.info.adminId, "AdminId not found");
    const desiredAttacker = this.players.get(
      (player) => player.id === this.info.adminId,
    );
    this.players.attacker = desiredAttacker;
    this.players.defender = this.players.attacker.left;
  }
}

export interface CanReceiveCards {
  receiveCards: (...cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (target: Target) => void;
}
