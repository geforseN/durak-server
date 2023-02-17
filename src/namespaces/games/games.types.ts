import { Namespace, Socket } from "socket.io";
import Card from "../../durak-game/entity/Card";
import { Suit } from "../../durak-game/utility.durak";
import { CardPlayerRole, CardPlayerStatus } from "../../durak-game/entity/Players/Player";
import DeskSlot from "../../durak-game/entity/DeskSlot";
import Self from "../../durak-game/DTO/Self.dto";
import Enemy from "../../durak-game/DTO/Enemy.dto";
import NotificationAlert from "../../module/notification-alert";

export type GameState = { self: Self, enemies: Enemy[], desk: DeskSlot[] }

export namespace GamesIO {
  export type ClientToServerEvents = {
    "state__restore": () => void

    "superPlayer__stopMove": () => void
    "superPlayer__putCardOnDesk": (card: Card, slotIndex: number, cb: ResponseCallback) => void
  }

  export type ServerToClientEvents = {
    "state__restore": (state: GameState) => void;
    "notification__send": (notification: NotificationAlert) => void;

    "talon__distributeCards": () => void;
    "talon__showTrumpCard": (trumpCard: Card) => void;

    "desk__pushCardsInDiscard": () => void;

    "role__update": (accname: string, role: CardPlayerRole) => void;
    "status__update": (accname: string, status: CardPlayerStatus) => void;
    "defendUI__shouldShow": (shouldShow: boolean) => void;
    "attackUI__shouldShow": (shouldShow: boolean) => void;

    "self__removeCard": (card: Card) => void;
    "enemies__changeCardCount": (accname: string, cardCount: number) => void;

    "desk__clear": () => void;
    "desk__insertAttackCard": (card: Card, slotIndex: number) => void;
    "desk__insertDefendCard": (card: Card, slotIndex: number) => void;
    "": () => void;
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


// ClientToServer "talon__distributeCards": () => void
// ClientToServer "discard__pushCards": () => void