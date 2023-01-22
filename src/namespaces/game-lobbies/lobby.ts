import { randomUUID } from "node:crypto";
import { LobbySettings } from "./game-lobbies.types";
import { User } from "../../db/user";

type LobbyConstructor = {adminAccName: string, settings: LobbySettings}

export default class Lobby {
  id: string
  settings: LobbySettings
  users: User[]
  adminAccName: string | null

  constructor({ adminAccName, settings }: LobbyConstructor) {
    this.id = randomUUID();
    this.settings = this.validateSettingsOrThrow(settings);
    this.users = [];
    this.adminAccName = adminAccName;
  }

  private validateSettingsOrThrow({ gameType, maxUserCount }: LobbySettings): LobbySettings | never {
    if (maxUserCount < 2 || maxUserCount > 6)
      throw new Error("Нельзя создать лобби из менее 2 или более 6 игроков");

    const isGameTypeCorrect = ["basic", "perevodnoy"].includes(gameType);
    if (!isGameTypeCorrect) throw new Error("Неверный тип игры");

    return { gameType, maxUserCount };
  }

  get hasMaxUsers(): boolean {
    return this.settings.maxUserCount === this.users.length;
  }

  ensureCanJoinLobby(): void | never {
    if (this.hasMaxUsers) throw new Error("Максимум игроков превышен");
  }

  hasSameId(id: string): boolean {
    return this.id === id;
  }

  // should be this.users.add(user)
  addUser(user: User) {
    this.users.push(user);
  }
}