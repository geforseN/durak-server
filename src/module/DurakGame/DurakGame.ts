import type {
  DurakGameSocket,
  GameSettings,
} from "@durak-game/durak-dts";

import type NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import type { GameMove } from "@/module/DurakGame/entity/GameMove/index.js";
import type { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import type { Players } from "@/module/DurakGame/entity/index.js";

import GameRoundMoves from "@/module/DurakGame/entity/GameRound/GameRoundMoves.js";
import GameRoundDistribution from "@/module/DurakGame/entity/GameRoundDistributionQueue.js";
import GameHistory from "@/module/DurakGame/entity/History.js";
import {
  Card,
  Desk,
  Discard,
  GameRound,
  Talon,
  createPlayers,
} from "@/module/DurakGame/entity/index.js";
import {
  type DurakGameWebsocketService,
  createServices,
} from "@/module/DurakGame/socket/service/index.js";

export default class DurakGame {
  readonly #wsService: DurakGameWebsocketService;
  readonly desk: Desk;
  readonly discard: Discard;
  readonly history: GameHistory;
  readonly info: {
    adminId: string;
    durakId?: string;
    id: string;
    namespace: DurakGameSocket.Namespace;
  };
  players: Players;
  round: GameRound;
  readonly settings: GameSettings;
  readonly talon: Talon;
  readonly talonDistribution: GameRoundDistribution;

  constructor(
    nonStartedGame: NonStartedDurakGame,
    namespace: DurakGameSocket.Namespace,
  ) {
    const wsServices = createServices(namespace);
    this.info = {
      ...nonStartedGame.info,
      namespace,
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
    this.history = new GameHistory([...this.players]);
  }

  get id() {
    return this.info.id;
  }

  #makeInitialSuperPlayers() {
    const admin = this.players.get((player) => player.info.isAdmin);
    this.players
      .mutateWith(admin.left.asDefender())
      .mutateWith(this.players.defender.right.asAttacker().asAllowed(this));
  }

  end() {
    const [durakPlayer] = this.players;
    // NOTE: durakPlayer may not exist if game ended with draw
    this.info.durakId = durakPlayer?.id;
    this.#wsService.end(this);
  }

  handleNewMove(move: GameMove<AllowedSuperPlayer>) {
    if (move.isInsertMove()) {
      move.makeCardInsert();
    }
    this.round.moves.push(move);
    const nextThing = move.gameMutationStrategy();
    if (nextThing?.kind === "RoundEnd") {
      nextThing.makeMutation();
      const { newGameRound } = nextThing;
      if (!newGameRound) {
        return this.end();
      }
      this.round = newGameRound;
    } else {
      this.players.allowed.setTimer();
    }
  }

  start() {
    this.#makeInitialSuperPlayers();
  }

  toGameJSON() {
    return {
      state: {
        __allowedPlayer: this.players.allowed.toJSON(),
        desk: this.desk.toJSON(),
        discard: this.discard.toJSON(),
        round: this.round.toJSON(),
        settings: this.settings,
        talon: this.talon.toJSON(),
      },
    };
  }
}

export interface CanReceiveCards {
  receiveCards: (..._cards: Card[]) => void;
}

export interface CanProvideCards<Target extends CanReceiveCards> {
  provideCards: (_target: Target) => void;
}
