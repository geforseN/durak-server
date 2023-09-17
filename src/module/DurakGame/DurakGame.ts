import type {
  DurakGameSocket,
  GameSettings,
  GameState,
} from "@durak-game/durak-dts";

import assert from "node:assert";
import { pino } from "pino";

import type NonStartedDurakGame from "./NonStartedDurakGame.js";

import GameRoundMoves from "./entity/GameRound/GameRoundMoves.js";
import GameRoundDistribution from "./entity/GameRoundDistributionQueue.js";
import {
  Card,
  Desk,
  Discard,
  GameRound,
  Players,
  Talon,
  createPlayers,
} from "./entity/index.js";
import { addListenersWhichAreNeededForStartedGame } from "./socket/DurakGameSocket.handler.js";
import {
  type DurakGameWebsocketService,
  createServices,
} from "./socket/service/index.js";

export default class DurakGame {
  readonly #wsService: DurakGameWebsocketService;
  readonly desk: Desk;
  readonly discard: Discard;
  history: any;
  readonly info: {
    adminId: string;
    durakId?: string;
    id: string;
    namespace: DurakGameSocket.Namespace;
    shouldGiveRequiredCards: boolean;
    shouldMakeInitialDistribution: boolean;
    shouldStartRightNow: boolean;
    status: GameState["status"];
  };
  readonly logger = pino({
    transport: {
      target: "pino-pretty" as const,
    },
  });
  players: Players;
  round: GameRound;
  readonly settings: GameSettings;
  readonly talon: Talon;
  readonly talonDistribution: GameRoundDistribution;

  constructor(
    nonStartedGame: NonStartedDurakGame,
    namespace: DurakGameSocket.Namespace,
    {
      shouldGiveRequiredCards = true,
      shouldMakeInitialDistribution = true,
      shouldStartRightNow = true,
    }: {
      shouldGiveRequiredCards?: boolean;
      shouldMakeInitialDistribution?: boolean;
      shouldStartRightNow?: boolean;
    } = {},
  ) {
    const wsServices = createServices(namespace);
    this.info = {
      ...nonStartedGame.info,
      namespace,
      shouldGiveRequiredCards,
      shouldMakeInitialDistribution,
      shouldStartRightNow,
      status: "starts",
    };
    this.settings = {
      ...nonStartedGame.settings,
      players: {
        ...nonStartedGame.settings.players,
        moveTime: 2147483647,
      },
    };
    this.talon = new Talon(this.settings.talon, wsServices.talonService);
    this.players = createPlayers(nonStartedGame, wsServices.playerService);
    this.discard = new Discard(wsServices.discardService);
    this.desk = new Desk(nonStartedGame.settings.desk, wsServices.deskService);
    this.#wsService = wsServices.gameService;
    this.round = new GameRound(this, new GameRoundMoves());
    this.talonDistribution = new GameRoundDistribution(this);
    this.history = {
      players: {
        leftPlayers: {
          count: 0,
          value: [],
        },
        value: [...this.players].map((player, index) => ({
          id: player.id,
          index,
          place: null,
          roundLeftNumber: null,
        })),
      },
      rounds: [],
    };

    if (this.info.shouldStartRightNow) {
      this.start();
    }
  }

  #makeInitialSuperPlayers() {
    const admin = this.players.get((player) => player.info.isAdmin);
    this.players
      .mutateWith(admin.left.asDefender())
      .mutateWith(this.players.defender.right.asAttacker().asAllowed(this));
  }

  end() {
    assert.ok(this.info.status === "started");
    this.info.status = "ended";
    const [durakPlayer] = this.players;
    // NOTE: durakPlayer may not exist if game ended with draw
    this.info.durakId = durakPlayer?.id;
    this.#wsService.end(this);
  }

  handleSocketConnection(
    socket: DurakGameSocket.Socket,
    _namespace: DurakGameSocket.Namespace,
  ) {
    addListenersWhichAreNeededForStartedGame.call(socket, this);
  }

  restoreState(socket: DurakGameSocket.Socket) {
    this.#wsService.restoreState(this, socket);
  }

  start() {
    assert.ok(this.info.status === "starts");
    if (this.info.shouldGiveRequiredCards) {
      [...this.players]
        .filter((player) => player.info.cardsToAdd.length)
        .forEach((player) => {
          player.receiveCards(
            ...player.info.cardsToAdd.map((card) =>
              this.talon.__test_only_getCard(card),
            ),
          );
        });
    }
    if (this.info.shouldMakeInitialDistribution) {
      this.talonDistribution.makeInitialDistribution();
    }
    this.#makeInitialSuperPlayers();
    this.info.status = "started";
  }
}

export interface CanReceiveCards {
  receiveCards: (..._cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (_target: Target) => void;
}

export interface ___________NextThingToDoInGame________ {
  kind: "Attacker" | "Defender" | "RoundEnd";
}

function createDurakGame({
  namespace,
}: {
  namespace: DurakGameSocket.Namespace;
  nonStartedGame: NonStartedDurakGame;
  shouldStartRightNow: boolean;
}) {
  return new DurakGame(namespace);
}
