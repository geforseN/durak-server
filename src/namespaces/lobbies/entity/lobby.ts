import { randomUUID } from "node:crypto";
import { GameSettings } from "../lobbies.types";
import LobbyUsers, { LobbyUser, LobbyUserIdentifier } from "./lobby-users";

export type LobbyConstructor = { adminAccname: string, settings: GameSettings }

export default class Lobby {
  id: string;
  settings: GameSettings;
  users: LobbyUsers;
  adminAccname: string | null;

  constructor({ adminAccname, settings }: LobbyConstructor) {
    this.id = randomUUID();
    this.settings = this.assertSettings(settings);
    this.users = new LobbyUsers();
    this.adminAccname = adminAccname;
  }

  get value(): any {
    return {
      ...this,
      users: this.users._value
    }
  }

  get hasMaxUsers(): boolean {
    return this.users.count === this.settings.maxUserCount;
  }

  get hasNoUsers(): boolean {
    return this.users.count === 0;
  }

  hasUser({ accname }: LobbyUserIdentifier): boolean {
    return this.users.hasUser({ accname });
  }

  addUser(user: LobbyUser): void {
    this.users.add(user);
  }

  findUser({ accname }: LobbyUserIdentifier): LobbyUser | undefined {
    return this.users.find({ accname });
  }

  removeUser({ accname }: LobbyUserIdentifier) {
    this.users.remove({ accname });
  }

  removeUserByIndex(index: number) {
    this.users.removeByIndex(index);
  }

  hasSameId(id: string): boolean {
    return this.id === id;
  }

  ensureCanEnter(): this | never {
    if (!this.hasMaxUsers) return this;
    throw new Error("Максимум игроков превышен");
  }


  updateAdmin(): string {
    this.adminAccname = this.users.firstUser.accname;
    return this.adminAccname;
  }

  private assertSettings({ gameType, maxUserCount, cardCount }: GameSettings): GameSettings | never {
    if (maxUserCount < 2 || maxUserCount > 6)
      throw new Error("Нельзя создать лобби из менее 2 или более 6 игроков");

    const isGameTypeCorrect = ["basic", "perevodnoy"].includes(gameType);
    if (!isGameTypeCorrect) throw new Error("Неверный тип игры");

    const isCardCountCorrect = [24, 36, 52].includes(cardCount);
    if (!isCardCountCorrect) throw new Error("Неверное количество карт");

    return { gameType, maxUserCount, cardCount };
  }

}