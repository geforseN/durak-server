import { ConnectStatus } from "@prisma/client";
import NoUserOrLobbyError from "../errors/NoUserOrLobby.error";

export type LobbyUser = {
  accname: string
  nickname: string
  photoUrl: string | null
  personalLink: string | null
  connectStatus: ConnectStatus
}
export type LobbyUserIdentifier = { accname: string }

export default class LobbyUsers {
  _value: LobbyUser[];

  constructor() {
    this._value = [];
  }

  get count(): number {
    return this._value.length;
  }

  get firstUser(): LobbyUser {
    return this._value[0];
  }

  get tryFirstUser(): LobbyUser | never {
    if (this.firstUser) return this.firstUser;
    throw new NoUserOrLobbyError();
  }

  hasUser({ accname }: LobbyUserIdentifier) {
    return Boolean(this.find({ accname }));
  }

  add(user: LobbyUser) {
    this._value.push(user);
  }

  find({ accname }: LobbyUserIdentifier): LobbyUser | undefined {
    return this._value.find((user) => user.accname === accname);
  }

  findIndex({ accname }: LobbyUserIdentifier): number {
    return this._value.findIndex(user => user.accname === accname);
  }

  remove({accname}: LobbyUserIdentifier) {
    this._value = this._value.filter((user) => user.accname !== accname)
  }

  removeByIndex(index: number) {
    this._value.splice(index, 1);
  }

  tryRemove({ accname }: LobbyUserIdentifier): void {
    const index = this.findIndex({ accname });
    if (index === -1) throw new NoUserOrLobbyError();
    this.removeByIndex(index)
  }
}