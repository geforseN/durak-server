import assert from "node:assert";
import { Discard, Desk, GameRound, Talon, Card, Players } from "./entity";
import {
  DurakGameWebsocketService,
  GamePlayerWebsocketService,
  GameDeskWebsocketService,
  GameTalonWebsocketService,
  GameDiscardWebsocketService,
  GameRoundWebsocketService,
} from "./socket/service";
import GameRoundDistributionQueue from "./GameRoundDistributionQueue";
import { type DurakGameSocket } from "./socket/DurakGameSocket.types";
import { type GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import { type UnstartedGame } from "./NonstartedDurakGame";

export default class DurakGame {
  readonly info: {
    id: string;
    adminId: string;
    namespace: DurakGameSocket.Namespace;
    durakId?: string;
    isStarted: true;
  };
  readonly settings: GameSettings;
  readonly talon: Talon;
  readonly discard: Discard;
  readonly desk: Desk;
  readonly #wsService: DurakGameWebsocketService;
  players: Players;
  round: GameRound;

  constructor(
    unstartedGame: UnstartedGame,
    namespace: DurakGameSocket.Namespace,
  ) {
    this.info = { ...unstartedGame.info, namespace, isStarted: true };
    this.settings = { ...unstartedGame.settings, moveTime: 90_000 };
    this.players = new Players(
      unstartedGame.players,
      new GamePlayerWebsocketService(namespace),
    );
    this.talon = new Talon(
      unstartedGame.settings,
      new GameTalonWebsocketService(namespace),
    );
    this.discard = new Discard(new GameDiscardWebsocketService(namespace));
    this.desk = new Desk(
      unstartedGame.settings.desk,
      new GameDeskWebsocketService(namespace),
    );
    this.#wsService = new DurakGameWebsocketService(namespace);
    // TODO: change code line below
    // NOTE: should be similar to => readonly this.distribution = new GameRoundDistribution(this);
    new GameRoundDistributionQueue(this).makeInitialDistribution();
    this.#makeInitialSuperPlayersStrategy();
    this.round = new GameRound(this, new GameRoundWebsocketService(namespace));
  }

  handleFailedDefence(): void {
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

  handleSuccessfulDefence(): void {
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

  // TODO: remove playerId param when socket.data will contain playerId
  restoreState(socket: DurakGameSocket.Socket, playerId: string) {
    this.#wsService.restoreState({ socket, game: this, playerId });
  }

  #prepareBeforeNewRound() {
    if (this.talon.isEmpty) {
      this.players = new Players(this.players);
      assert.ok(this.players.count !== 1);
    } else {
      // TODO: change code line below
      // NOTE: should be similar to => this.distribution.make()
      new GameRoundDistributionQueue(this).makeDistribution();
    }
  }

  #end() {
    const [durak] = this.players;
    this.info.durakId = durak.id;
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
