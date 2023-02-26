import { ConnectStatus } from "@prisma/client";

export type LobbyUser = {
  accname: string
  nickname: string
  photoUrl: string | null
  personalLink: string | null
  connectStatus: ConnectStatus
}
export type LobbyUserIdentifier = { accname: string }

export default class LobbyUsers {
  __value: LobbyUser[];

  constructor() {
    this.__value = [];
  }

  get value(): LobbyUser[] {
    return this.__value;
  }

  get count(): number {
    return this.__value.length;
  }

  get firstUser(): LobbyUser {
    return this.__value[0];
  }

  hasUser({ accname }: LobbyUserIdentifier) {
    return Boolean(this.find({ accname }));
  }

  add(user: LobbyUser) {
    this.__value.push(user);
  }

  find({ accname }: LobbyUserIdentifier): LobbyUser | undefined {
    return this.__value.find((user) => user.accname === accname);
  }

  remove({accname}: LobbyUserIdentifier) {
    this.__value = this.__value.filter((user) => user.accname !== accname)
  }
}