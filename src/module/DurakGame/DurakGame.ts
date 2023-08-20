import assert from "node:assert";
import { Discard, Desk, GameRound, Talon, Card, Players } from "./entity";
import {
  DurakGameWebsocketService,
  GamePlayerWebsocketService,
  GameDeskWebsocketService,
  GameTalonWebsocketService,
  GameDiscardWebsocketService,
} from "./socket/service";
import GameRoundDistributionQueue from "./entity/GameRoundDistributionQueue";
import { type DurakGameSocket } from "./socket/DurakGameSocket.types";
import { type GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import type NonStartedDurakGame from "./NonStartedDurakGame";
import pino from "pino";

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
  readonly isStarted: true;
  readonly logger = pino({
    transport: {
      target: "pino-pretty" as const,
    },
  });
  isEnded = false;
  readonly initialPlayers: {
    id: string;
    place: number | null;
    roundLeftNumber: number | null;
    index: number;
  }[];
  leftPlayersCount: number;

  constructor(
    nonStartedGame: NonStartedDurakGame,
    namespace: DurakGameSocket.Namespace,
  ) {
    this.info = { ...nonStartedGame.info, namespace, isStarted: true };
    this.settings = { ...nonStartedGame.settings, moveTime: 90_000 };
    this.players = new Players(
      nonStartedGame.players,
      new GamePlayerWebsocketService(namespace),
    );
    this.talon = new Talon(
      nonStartedGame.settings,
      new GameTalonWebsocketService(namespace),
    );
    this.discard = new Discard(new GameDiscardWebsocketService(namespace));
    this.desk = new Desk(
      nonStartedGame.settings.desk,
      new GameDeskWebsocketService(namespace),
    );
    this.#wsService = new DurakGameWebsocketService(namespace);
    new GameRoundDistributionQueue(this).makeInitialDistribution();
    this.#makeInitialSuperPlayersStrategy();
    this.round = new GameRound(this);
    this.isStarted = true;
    this.initialPlayers = this.players.value.map((player, index) => ({
      id: player.id,
      place: null,
      roundLeftNumber: null,
      index,
    }));
    this.leftPlayersCount = 0;
  }

  restoreState(socket: DurakGameSocket.Socket) {
    this.#wsService.restoreState(this, socket);
  }

  #makeInitialSuperPlayersStrategy() {
    assert.ok(this.info.adminId, "AdminId not found");
    const desiredAttacker = this.players.get(
      (player) => player.id === this.info.adminId,
    );
    this.players.attacker = desiredAttacker;
    this.players.defender = this.players.attacker.left;
  }

  end() {
    this.isEnded = true;
    const [durakPlayer] = this.players;
    this.info.durakId = durakPlayer.id;
    this.#wsService.end(this);
  }
}

export interface CanReceiveCards {
  receiveCards: (...cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (target: Target) => void;
}
