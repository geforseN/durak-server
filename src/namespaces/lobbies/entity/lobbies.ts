import Lobby from "./lobby";
import { LobbyUserIdentifier } from "./lobby-users";

export type LobbyIdentifier = { id: string };

export default class Lobbies {
  private readonly __value: Lobby[];

  get value() {
    return this.__value.map((lobby) => lobby.value)
  }

  constructor() {
    this.__value = [];
  }

  addLobby(lobby: Lobby) {
    this.__value.push(lobby);
  }

  isContainsUser({ accname }: LobbyUserIdentifier) {
    return this.__value.some((lobby) => lobby.hasUser({ accname }));
  }

  findLobby({ id }: LobbyIdentifier): Lobby | undefined {
    return this.__value.find((lobby) => lobby.hasSameId(id));
  }

  findLobbyIndex({ id }: LobbyIdentifier) {
    return this.__value.findIndex((lobby) => lobby.hasSameId(id));
  }

  tryFindLobby({ id }: LobbyIdentifier): Lobby | never {
    const lobby = this.findLobby({ id });
    if (!lobby) throw new Error("Лобби не найдено");
    return lobby;
  }

  findLobbyWithUser({accname}: LobbyUserIdentifier): Lobby | undefined {
    for (const lobby of this.__value) {
      const user = lobby.findUser({ accname });
      if (user) return lobby;
    }
  }

  deleteLobbyById({id}: LobbyIdentifier) {
    const index = this.findLobbyIndex({id})
    this.deleteLobbyByIndex(index);
  }

  deleteLobbyByIndex(index: number) {
    this.__value.splice(index, 1);
  }
}
