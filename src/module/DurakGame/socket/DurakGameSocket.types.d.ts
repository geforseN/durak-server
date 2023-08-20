import type {
  Namespace as SocketIONamespace,
  Socket as SocketIOSocket,
} from "socket.io";
import type NotificationAlert from "../../notification-alert";
import type { CardDTO, DurakGameStateDTO } from "../DTO";
import type { Player, PlayerKind } from "../entity/Player";
import type {
  ConnectStatus,
  DurakGame,
  User,
  UserGamePlayer,
  UserProfile,
} from "@prisma/client";
import { BetterDurakGameState } from "../DTO/DurakGameState.dto";

export namespace DurakGameSocket {
  export type ClientToServerEvents = {
    player__exitGame: () => void;
    superPlayer__stopMove: () => void;
    superPlayer__putCardOnDesk: (card: CardDTO, slotIndex: number) => void;
  };

  export type ServerToClientEvents = {
    "nonStartedGame::details": (payload: {
      joinedPlayersIds: Player["id"][];
    }) => void;
    "nonStartedGame::playerJoined": (payload: {
      player: { id: Player["id"] };
    }) => void;
    "finishedGame::restore": (
      game: DurakGame & { players: UserGamePlayer[] },
    ) => void;
    "finishedGame::notFound": () => void;
    "notification::push": (notification: NotificationAlert) => void;
    "game::state::restore": (payload: {
      _state: DurakGameStateDTO;
      state: BetterDurakGameState;
    }) => void;
    // TODO add more payload data to 'game::over' event
    "game::over": (payload: { durak: { id: Player["id"] } }) => void;
  } & DeskServerToClientEvents &
    DiscardServerToClientEvents &
    MoveServerToClientEvents &
    PlayerServerToClientEvents &
    RoundServerToClientEvents &
    TalonServerToClientEvents;

  type DeskServerToClientEvents = {
    "desk::becameClear": () => void;
    "desk::receivedCard": (payload: {
      card: CardDTO;
      slot: { index: number };
      source: { id: Player["id"] };
    }) => void;
  };

  type DiscardServerToClientEvents = {
    "discard::receivedCards": (payload: {
      addedCardsCount: number;
      // NOTE: it is not best idea to emit count of discard cards
      // discard cards count can be used for cheating
      // user always can inject JavaScript code
      totalCardsCount?: number;
    }) => void;
    "discard::becameFilled": () => void;
  };

  type MoveServerToClientEvents = {
    "move::new": (payload: {
      move: {
        name: string;
        allowedPlayer: { id: string };
        endTime: { UTC: number };
        timeToMove?: number;
      };
    }) => void;
  };

  type PlayerServerToClientEvents = {
    "player::receiveCards": (payload: {
      player:
        | {
            id: Player["id"];
            addedCardsCount: number;
            handCount?: number;
          }
        | {
            addedCards: CardDTO[];
            handCount?: number;
          };
    }) => void;
    "player::removeCard": (
      payload:
        | {
            player: {
              id: Player["id"];
              newCardsCount?: number;
            };
          }
        | {
            player?: { newCardsCount: number };
            card: CardDTO;
          },
    ) => void;
    "player::changedKind": (payload: {
      player:
        | {
            id: Player["id"];
            newKind: PlayerKind;
          }
        | {
            newKind: PlayerKind;
          };
    }) => void;
    "player::leftGame": (
      payload: { player: { id: Player["id"] } } | void,
    ) => void;
  };

  type RoundServerToClientEvents = {
    "round::new": (payload: { roundNumber: number }) => void;
    "round::becameEnded": (payload: {
      round: {
        number: number;
        defender: {
          // NOTE: frontend should know who is defender
          // so data about defender id can be omitted
          id?: Player["id"];
          isSuccessfullyDefended: boolean;
        };
      };
    }) => void;
  };

  type TalonServerToClientEvents = {
    "talon::madeDistribution": (payload: {
      receiver: {
        id: Player["id"];
      };
      distributionCards: {
        count: number;
        isMainTrumpCardIncluded: boolean;
      };
      talon: {
        // NOTE: it is not best idea to emit card count of talon
        // talon card count can be used for cheating
        // user always can inject JavaScript code
        cardCount?: number;
        isOnlyTrumpCardRemained: boolean;
      };
    }) => void;
  };

  export type InterServerEvents = Record<string, never>;

  export type SocketData = {
    sessionId: string;
    userProfile: UserProfile;
    user: User;
  };

  export type Socket = SocketIOSocket<
    DurakGameSocket.ClientToServerEvents,
    DurakGameSocket.ServerToClientEvents,
    DurakGameSocket.InterServerEvents,
    DurakGameSocket.SocketData
  >;

  export type Namespace = SocketIONamespace<
    DurakGameSocket.ClientToServerEvents,
    DurakGameSocket.ServerToClientEvents,
    DurakGameSocket.InterServerEvents,
    DurakGameSocket.SocketData
  >;
}
