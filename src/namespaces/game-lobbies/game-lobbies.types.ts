import { Namespace, Socket } from "socket.io";
import { User } from "../../db/user";
import NotificationAlert from "../../module/notification-alert";
import Lobby from "./lobby";

type LoggedUserToServerEvents = {
  "createLobby": (room: LobbySettings) => void;

  "joinLobby": (lobbyId: string, cellIndex: number) => void;
  "leaveLobby": () => void;
};

type LobbyAdminToServerEvents = {
  "createGame": (accName: string, lobbyId: string) => void;

  "removeUser__": () => void;
  "inviteUser__": () => void;
  "deleteLobby__": () => void;
  "makeUserLobbyAdmin__": () => void;
};

export namespace GameLobbiesIO {
  export type ClientToServerEvents =
    LoggedUserToServerEvents & LobbyAdminToServerEvents;

  export type ServerToClientEvents = {
    "restoreLobbies": (lobbies: Lobby[]) => void;
    "lobbyCreated": (lobby: Lobby) => void;
    "addedUser": (user: User, lobbyId: string) => void;
    "removeUser": (accName: string, lobbyId: string) => void;
    "deleteLobby": (lobbyId: string) => void;
    "sendNotification": (notification: NotificationAlert) => void;
    "updateLobbyAdmin": (adminAccName: string, lobbyId: string) => void;

    "updateLobbySettings__": (settings: LobbySettings, lobbyId: string) => void;

    "startGame": (gameId: string) => void;
  };

  export type InterServerEvents = {};

  export type SocketData = {
    accName: string
  };

  export type SocketIO = Socket<
    GameLobbiesIO.ClientToServerEvents,
    GameLobbiesIO.ServerToClientEvents,
    GameLobbiesIO.InterServerEvents,
    GameLobbiesIO.SocketData
  >;

  export type NamespaceIO = Namespace<
    GameLobbiesIO.ClientToServerEvents,
    GameLobbiesIO.ServerToClientEvents,
    GameLobbiesIO.InterServerEvents,
    GameLobbiesIO.SocketData
  >;
}

export type MaxUserCount = 2 | 3 | 4 | 5 | 6;
export type GameType = "basic" | "perevodnoy";

export type LobbySettings = {
  maxUserCount: MaxUserCount;
  gameType: GameType;
};

