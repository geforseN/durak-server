import { Namespace, Socket } from "socket.io";
import { User } from "../../db/user";
import { NotificationAlert } from "../../notification-alert.type";

export type MaxUser = 2 | 3 | 4 | 5 | 6;
export type GameType = "basic" | "perevodnoy";


export type Lobby = {
  id: string;
  users: User[];
  settings: LobbySettings;
};

export type LobbySettings = {
  maxUsers: MaxUser;
  gameType: GameType;
};


type LoggedUserToServerEvents = {
  initiateLobbyCreation: (room: LobbySettings) => void;

  joinLobby: (lobbyId: string, cellIndex: number) => void;
  leaveLobby: () => void;
};

type LobbyAdminToServerEvents = {
  removeUser: () => void;
  inviteUser: () => void;
  deleteLobby: () => void;
  makeOtherUserLobbyAdmin: () => void;
};

export namespace GameLobbiesIO {
  export type ClientToServerEvents = LoggedUserToServerEvents &
    LobbyAdminToServerEvents;

  export type ServerToClientEvents = {
    restoreHistory: (gameLobbiesCashe: Lobby[]) => void;
    lobbyCreated: (lobby: Lobby) => void;
    updateLobbySettings: () => void;
    addedUser: (user: User, lobbyId: string) => void;
    removePlayer: () => void;
    deleteLobby: () => void;
    sendNotification: (notification: NotificationAlert) => void
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
