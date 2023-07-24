import {
  Namespace as SocketIONamespace,
  Socket as SocketIOSocket,
} from "socket.io";
import NotificationAlert from "../../notification-alert";
import { CardDTO, DurakGameStateDTO } from "../DTO";
import { PlayerKind } from "../entity/Player";

export namespace DurakGameSocket {
  export type ClientToServerEvents = {
    player__exitGame: () => void;
    superPlayer__stopMove: () => void;
    superPlayer__putCardOnDesk: (card: CardDTO, slotIndex: number) => void;
  };

  export type ServerToClientEvents = {
    notification__send: (notification: NotificationAlert) => void;
    game__restoreState: (state: DurakGameStateDTO) => void;
    game__over: () => void;
    game__currentId: (gameId: string) => void;
    player__allowedToMove: (
     payload: {
      allowedPlayerId: string,
      moveEndTimeInUTC: number,
      moveTimeInSeconds: number,
     }
    ) => void;
    player__changeCardCount: (playerId: string, cardCount: number) => void;
    player__changeKind: (kind: PlayerKind, playerId: string) => void;
    player__exitGame: (playerId: string) => void;
    player__receiveCards: (cards: CardDTO[]) => void;
    defender__gaveUp: (payload: { defenderId: string }) => void;
    defender__lostRound: (id: string, roundNumber: number) => void;
    defender__wonRound: (id: string, roundNumber: number) => void;
    superPlayer__removeCard: (card: CardDTO) => void;
    desk__clear: () => void;
    desk__cardReceive: (
      card: CardDTO,
      slotIndex: number,
      whoId: string,
    ) => void;
    talon__distributeCardsTo: (playerId: string, cardCount: number) => void;
    talon__keepOnlyTrumpCard: () => void;
    talon__moveTrumpCardTo: (playerId: string) => void;
    discard__receiveCards: (cardCount: number) => void;
    discard__setIsNotEmpty: () => void;
  };

  export type InterServerEvents = {};

  export type SocketData = {
    sid: string;
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
