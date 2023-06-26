import { lobbiesService, lobbies } from "../../index";
import Lobby, { LobbyConstructor } from "./entity/lobby";
import { LobbiesIO, GameSettings } from "./lobbies.types";
import { LobbyUser, LobbyUserIdentifier } from "./entity/lobby-users";
import Lobbies, { LobbyIdentifier } from "./entity/lobbies";
import NotificationAlert from "../../module/notification-alert";

export default class LobbiesService {
  constructor(
    private lobbies: Lobbies,
    private namespace: LobbiesIO.NamespaceIO,
  ) {
  }

  get lobbiesValue() {
    return this.lobbies.value;
  }

  // TODO ACKNOWLEDGMENT EMIT
  //  НУЖНО НА КЛИЕНТЕ РЕАЛИЗОВАТЬ ПРЕДУПРЕЖДЕНИЕ,
  //  ЧТО ПОЛЬЗОВАТЕЛЬ НАХОДИТСЯ В ДРУГОМ ЛОББИ
  handleLobbyCreation(user: any, settings: GameSettings) {
    const inAnotherLobby = this.lobbies.isContainsUser({ accname: user.accname });
    if (inAnotherLobby) this.handleUserDisconnect({ accname: user.accname });
    const lobby = this.createLobby({ adminAccname: user.accname, settings });
    this.addUserInLobby(lobby, user);
    return lobby;
  }

  private createLobby({ adminAccname, settings }: LobbyConstructor): Lobby {
    const lobby = new Lobby({ adminAccname, settings });
    this.lobbies.addLobby(lobby);
    this.namespace.emit("lobbyCreated", lobby.value);
    return lobby;
  }

  addUserInLobby(lobby: Lobby, user: any): void {
    lobby.addUser(user);
    this.namespace.emit("addedUser", user, lobby.id);
  }

  handleUserDisconnect({ accname }: LobbyUserIdentifier): void {
    const lobby = this.lobbies.findLobbyWithUser({ accname });
    if (!lobby) return;

    this.removeUserFromLobby(lobby, { id: accname });
    if (lobby.hasNoUsers) {
      this.deleteLobby(lobby);
    } else {
      this.updateLobbyAdmin(lobby);
    }
  }

  prepareBeforeJoin({ accname }: LobbyUserIdentifier, { id }: LobbyIdentifier) {
    const lobby = lobbies.tryFindLobby({ id });
    lobby.ensureCanEnter();
    lobbiesService.handleUserDisconnect({ accname });
    return lobby;
  }

  removeUserFromLobby(lobby: Lobby, { id }: { id: string }) {
    lobby.removeUser({ accname: id });
    this.namespace.emit("removeUser", id, lobby.id);
  }

  updateLobbyAdmin(lobby: Lobby): void {
    this.namespace.emit("updateLobbyAdmin", lobby.updateAdmin(), lobby.id);
  }

  deleteLobby(lobby: Lobby): void {
    const index = this.lobbies.findLobbyIndex({ id: lobby.id })!;
    this.lobbies.deleteLobbyByIndex(index);
    this.namespace.emit("deleteLobby", lobby.id);
  }

  sendNotification(error: Error, { accname }: LobbyUserIdentifier): void {
    const notification = new NotificationAlert().fromError(error);
    this.namespace.to(accname).emit("sendNotification", notification);
  }

  handleError({ name, error, socket }: { name: string, error: Error | unknown, socket: LobbiesIO.SocketIO }) {
    const accname = socket.data?.sid ?? socket.id;
    if (error instanceof Error) error.name = name;
    lobbiesService.sendNotification(error as Error, { accname });
    console.log(name, ": ", error);
  }
}
