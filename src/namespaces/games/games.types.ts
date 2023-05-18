import { Namespace, Socket } from "socket.io";
import NotificationAlert from "../../module/notification-alert";
import DurakGameStateDto from "../../durak-game/DTO/DurakGameState.dto";
import CardDTO from "../../durak-game/DTO/Card.dto";

export type PlayerRole = "Defender" | "Attacker" | "Player";

export namespace GamesIO {
  export type ClientToServerEvents = {
    "player__gaveUp": () => void;
    "superPlayer__stopMove": () => void;
    "superPlayer__putCardOnDesk": (card: CardDTO, slotIndex: number) => void;
  }

  export type ServerToClientEvents = {
    "state__restore": (state: DurakGameStateDto) => void;
    "notification__send": (notification: NotificationAlert) => void;
    "game__over": () => void

    "talon__distributeCardsTo": (playerId: string, cardCount: number) => void;
    "talon__keepOnlyTrumpCard": () => void;
    "talon__moveTrumpCardTo": (playerId: string) => void;

    "player__changeRole": (role: PlayerRole, id: string) => void;
    "player__receiveCards": (cards: CardDTO[]) => void;
    "player__allowedToMove": (id: string, timeEnd: number, moveTime: number) => void;
    "self__removeCard": (card: CardDTO) => void;
    "enemy__changeCardCount": (id: string, cardCount: number) => void;
    "defender__gaveUp": () => void;
    "defender__lostRound": (id: string, roundNumber: number) => void;
    "defender__wonRound": (id: string, roundNumber: number) => void;

    "desk__clear": () => void;
    "player__insertCard": (card: CardDTO, slotIndex: number, whoId: string) => void;
    "discard__receiveCards": (cardCount: number) => void;
    "discard__setIsNotEmpty": () => void;
  }

  export type InterServerEvents = {}

  export type SocketData = {
    accname: string
    id?: string
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
