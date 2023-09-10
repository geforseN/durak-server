import type { DurakGameSocket, GameSettings } from "@durak-game/durak-dts";
import type NonStartedDurakGame from "./NonStartedDurakGame.js";
import GameRoundMoves from "./entity/GameRound/GameRoundMoves.js";
import GameRoundDistribution from "./entity/GameRoundDistributionQueue.js";
import NonStartedGameUser from "./entity/Player/NonStartedGameUser.js";
import {
  Card,
  Desk,
  Discard,
  GameRound,
  Players,
  Talon,
} from "./entity/index.js";
import { addListenersWhichAreNeededForStartedGame } from "./socket/DurakGameSocket.handler.js";
import {
  DurakGameWebsocketService,
  GameDeskWebsocketService,
  GameDiscardWebsocketService,
  GamePlayerWebsocketService,
  GameTalonWebsocketService,
} from "./socket/service/index.js";
import { pino } from "pino";
import type { GameState } from "@durak-game/durak-dts";
import { Player } from "./entity/Player/Player.js";
import { Hand } from "./entity/Deck/index.js";

export class InternalGameLogicError extends Error {}

export default class DurakGame {
  readonly info: {
    id: string;
    adminId: string;
    namespace: DurakGameSocket.Namespace;
    durakId?: string;
    status: GameState["status"];
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
    };
    this.settings = {
      ...nonStartedGame.settings,
      moveTime: 2147483647,
    };
    const playersData = nonStartedGame.usersInfo
      .map(
        (info, index, array) =>
          new NonStartedGameUser({
            index,
            info,
            lobbySlotsCount: array.length,
            wsService: new GamePlayerWebsocketService(namespace),
            hand: new Hand(),
          }),
      )
      .map((user) => Player.create(user));
    const players = playersData.map((data) => data[1]);
    playersData.forEach(([leftPlayerIndex, player, rightPlayerIndex]) => {
      player.left = players[leftPlayerIndex];
      player.right = players[rightPlayerIndex];
    });
    this.players = new Players(players);
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
    const admin = this.players.get((player) => player.info.isAdmin);
    this.players
      .mutateWith(admin.left.asDefender())
      .mutateWith(this.players.defender.right.asAttacker().asAllowed(this));
  }

  end() {
    this.info.status = "ended";
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
