import { Namespace, Socket } from "socket.io";
import Card from "../../durak-game/entity/Card";
import { Suit } from "../../durak-game/utility";
import NotificationAlert from "../../module/notification-alert";
import GameState from "../../durak-game/DTO/GameState";


export type SocketResponse = { status: "ATT" | "DEF" } | { status: "NOK", message: string };
export type ResponseCallback = (res: SocketResponse) => void;

export type PlayerRole = "Defender" | "Attacker" | "Player";
export type UIStatus = "revealed" | "hidden" | "freeze";

export namespace GamesIO {
  export type ClientToServerEvents = {
    "state__restore": () => void

    "superPlayer__stopMove": () => void
    "superPlayer__putCardOnDesk": (card: Card, slotIndex: number, cb: ResponseCallback) => void
  }

  export type ServerToClientEvents = {
    "state__restore": (state: GameState) => void;
    "notification__send": (notification: NotificationAlert) => void;

    "talon__distributeCards": (accname: string, cardCountToDistribute: number) => void;
    "talon__showTrumpCard": (trumpCard: Card) => void;
    "talon__moveTrumpCardTo": (accname: string) => void;

    "defendUI__setStatus": (status: UIStatus) => void;
    "attackUI__setStatus": (status: UIStatus) => void;

    "player__changeRole": (role: PlayerRole, accname: string) => void;
    "player__receiveCards": (cards: Card[]) => void;
    "player__allowedToMove": (accname: string) => void;
    "self__removeCard": (card: Card) => void;
    "enemy__changeCardCount": (accname: string, cardCount: number) => void;
    "defender__lostRound": (accname: string) => void;
    "defender__wonRound": (accname: string) => void;

    "desk__clear": () => void;
    "desk__insertAttackCard": (card: Card, slotIndex: number) => void;
    "desk__insertDefendCard": (card: Card, slotIndex: number) => void;
    "desk__pushToDiscard": () => void;
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
