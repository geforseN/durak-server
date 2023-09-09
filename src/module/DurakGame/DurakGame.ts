import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";
import type NonStartedDurakGame from "./NonStartedDurakGame.js";
import GameRoundMoves from "./entity/GameRound/GameRoundMoves.js";
import GameRoundDistribution from "./entity/GameRoundDistributionQueue.js";
import NonStartedGameUser from "./entity/__Player/NonStartedGameUser.js";
import { Card, Desk, Discard, GameRound, Players, Talon } from "./entity/index.js";
import { addListenersWhichAreNeededForStartedGame } from "./socket/DurakGameSocket.handler.js";
import {
  DurakGameWebsocketService,
  GameDeskWebsocketService,
  GameDiscardWebsocketService,
  GameTalonWebsocketService
} from "./socket/service/index.js";
import { pino } from "pino";

export class InternalGameLogicError extends Error {}

export default class DurakGame {
  readonly info: {
    id: string;
    adminId: string;
    namespace: DurakGameSocket.Namespace;
    durakId?: string;
    isStarted: true;
    status: "starts" | "started";
  };
  readonly settings: GameSettings;
  readonly talon: Talon;
  readonly discard: Discard;
  readonly desk: Desk;
  readonly #wsService: DurakGameWebsocketService;
  players: Players;
  round: GameRound;
  readonly distribution: GameRoundDistribution;
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
    this.info = {
      ...nonStartedGame.info,
      namespace,
      status: "starts",
      isStarted: true, // TODO remove isStarted
    };
    this.settings = {
      ...nonStartedGame.settings,
      moveTime: nonStartedGame.settings.moveTime * 1000,
    };
    this.players = nonStartedGame.usersInfo.map(
      (info, index, array) =>
        new NonStartedGameUser({ index, info, lobbySlotsCount: array.length }),
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
    this.distribution = new GameRoundDistribution(
      this,
    ).makeInitialDistribution();
    this.#makeInitialSuperPlayers();
    this.round = new GameRound(this, new GameRoundMoves());
    this.initialPlayers = [...this.players].map((player, index) => ({
      id: player.id,
      place: null,
      roundLeftNumber: null,
      index,
    }));
    this.leftPlayersCount = 0;
    this.info.status = "started";
  }

  restoreState(socket: DurakGameSocket.Socket) {
    this.#wsService.restoreState(this, socket);
  }

  handleSocketConnection(
    socket: DurakGameSocket.Socket,
    namespace: DurakGameSocket.Namespace,
  ) {
    addListenersWhichAreNeededForStartedGame.call(socket, this);
  }

  #makeInitialSuperPlayers() {
    this.players = this.players
      .with(this.players.get((player) => player.isAdmin).left.asDefender())
      .with(this.players.defender.right.asAttacker().asAllowed(this));
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

export interface NextThingToDoInGame {
  kind: "RoundEnd" | "Defender" | "Attacker";
}
