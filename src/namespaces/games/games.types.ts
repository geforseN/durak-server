import { Namespace, Socket } from "socket.io";
import Card from "../../durak-game/entity/Card";
import { Suit } from "../../durak-game/utility";
import NotificationAlert from "../../module/notification-alert";
import DurakGameStateDto from "../../durak-game/DTO/DurakGameState.dto";

export type PlayerRole = "Defender" | "Attacker" | "Player";
export type UIStatus = "revealed" | "hidden" | "freeze";

export namespace GamesIO {
  export type ClientToServerEvents = {
    "state__restore": () => void
    "superPlayer__stopMove": () => void
    "superPlayer__putCardOnDesk": (card: Card, slotIndex: number) => void
  }

  export type ServerToClientEvents = {
    "state__restore": (state: DurakGameStateDto) => void;
    "notification__send": (notification: NotificationAlert) => void;

    "talon__distributeCards": (id: string, cardCount: number) => void;
    "talon__showTrumpCard": (trumpCard: Card) => void;
    "talon__moveTrumpCardTo": (id: string) => void;

    "defendUI__setStatus": (status: UIStatus) => void;
    "attackUI__setStatus": (status: UIStatus) => void;

    "player__changeRole": (role: PlayerRole, id: string) => void;
    "player__receiveCards": (cards: Card[]) => void;
    "player__allowedToMove": (id: string) => void;
    "self__removeCard": (card: Card) => void;
    "enemy__changeCardCount": (id: string, cardCount: number) => void;
    "defender__lostRound": (id: string, roundNumber: number) => void;
    "defender__wonRound": (id: string, roundNumber: number) => void;

    "desk__clear": () => void;
    "player__insertCard": (card: Card, slotIndex: number, whoId: string) => void;
    "discard__receiveCards": (cardCount: number) => void;
    "game__over": () => void
  }

  export type InterServerEvents = {}

  export type SocketData = {
    accname: string
    role?: "USER" | "GUEST"
    badTriesCount?: number
  }

  export type SocketIO = Socket<
    GamesIO.ClientToServerEvents,
    GamesIO.ServerToClientEvents,
    GamesIO.InterServerEvents,
    GamesIO.SocketData
  >

  export type NamespaceIO = Namespace<
    GamesIO.ClientToServerEvents,
    GamesIO.ServerToClientEvents,
    GamesIO.InterServerEvents,
    GamesIO.SocketData
  >
}

export type AdditionalGameState = {
  isDiscardEmpty: boolean;
  isTalonEmpty: boolean;
  turnNumber: number;
  trumpSuit: Suit;
  trump?: Card;
}
