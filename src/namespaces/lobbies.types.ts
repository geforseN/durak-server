import { Namespace, Socket } from "socket.io";
import NotificationAlert from "../module/notification-alert";

type LoggedUserToServerEvents = {
  createLobby: (room: GameSettings) => void;
  joinLobby: (lobbyId: string, cellIndex: number) => void;
  leaveLobby: (lobbyId: string) => void;
};

type LobbyAdminToServerEvents = {
  createGame: (accname: string, lobbyId: string) => void;
  removeUser__: () => void;
  inviteUser__: () => void;
  deleteLobby__: () => void;
  makeUserLobbyAdmin__: () => void;
};

export namespace LobbiesIO {
  export type ClientToServerEvents = LoggedUserToServerEvents &
    LobbyAdminToServerEvents;

  export type ServerToClientEvents = {
    restoreLobbies: (lobbies: {}[]) => void;
    lobbyCreated: (lobby: {}) => void;
    addedUser: (user: {}, lobbyId: string) => void;
    removeUser: (accname: string, lobbyId: string) => void;
    deleteLobby: (lobbyId: string) => void;
    sendNotification: (notification: NotificationAlert) => void;
    updateLobbyAdmin: (adminAccname: string, lobbyId: string) => void;
    redirectToLogin: () => void;
    updateLobbySettings__: (settings: GameSettings, lobbyId: string) => void;
    startGame: (gameId: string) => void;
  };

  export type InterServerEvents = {};

  export type SocketData = {
    sid: string;
  };

  export type SocketIO = Socket<
    LobbiesIO.ClientToServerEvents,
    LobbiesIO.ServerToClientEvents,
    LobbiesIO.InterServerEvents,
    LobbiesIO.SocketData
  >;

  export type NamespaceIO = Namespace<
    LobbiesIO.ClientToServerEvents,
    LobbiesIO.ServerToClientEvents,
    LobbiesIO.InterServerEvents,
    LobbiesIO.SocketData
  >;
}

export type MaxUserCount = 2 | 3 | 4 | 5 | 6;
export type GameType = "basic" | "perevodnoy";
export type CardCount = 24 | 36 | 52;

export type GameSettings = {
  maxUserCount: MaxUserCount;
  gameType: GameType;
  cardCount: CardCount;
  moveTime: number;
};
