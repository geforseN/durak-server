import assert from "node:assert";
import { Discard, Desk, GameRound, Talon, Card, Players } from "./entity";
import {
  DurakGameWebsocketService,
  GamePlayerWebsocketService,
  GameDeskWebsocketService,
  GameTalonWebsocketService,
  GameDiscardWebsocketService,
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
  isStarted: boolean;
  
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
    new GameRoundDistributionQueue(this).makeInitialDistribution();
    this.#makeInitialSuperPlayersStrategy();
    this.round = new GameRound(this);
    this.isStarted = true;
  }

  // TODO: remove playerId param when socket.data will contain playerId
  restoreState(socket: DurakGameSocket.Socket, playerId: string) {
    this.#wsService.restoreState({ socket, game: this, playerId });
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
