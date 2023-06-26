import assert from "node:assert";
import { GOOD_CARD_AMOUNT } from "../../DurakGame/entity/Player/Player";

export type UserCount = 2 | 3 | 4 | 5 | 6;
export type GameType = "basic" | "perevodnoy";
export type CardCount = 24 | 36 | 52;

export type GameSettings = {
  userCount: UserCount;
  gameType: GameType;
  cardCount: CardCount;
  moveTime: number;
}

export default class CorrectGameSettings {
  userCount: UserCount;
  gameType: GameType;
  cardCount: CardCount;
  moveTime: number;

  constructor({ userCount, cardCount, gameType, moveTime = 15_000 }: GameSettings) {
    this.userCount = userCount;
    this.cardCount = cardCount;
    this.gameType = gameType;
    this.moveTime = moveTime;
    this.#ensureCorrectUserCount(this.userCount);
    this.#ensureCorrectCardCount(this.cardCount);
    this.#ensureCorrectGameType(this.gameType);
    this.ensureEnoughCardsForUsers(this.cardCount, this.userCount);
  }

  #ensureCorrectUserCount(userCount: number): asserts userCount is UserCount {
    assert.ok(this.#allowedUserCount.includes(userCount), "Нельзя создать лобби из менее двух или более шести игроков");
  }

  get #allowedUserCount() {
    return [2, 3, 4, 5, 6];
  }

  #ensureCorrectCardCount(cardCount: number): asserts cardCount is CardCount {
    assert.ok(this.#allowedCardCount.includes(cardCount), "Неверное количество карт");
  }

  get #allowedCardCount() {
    return [24, 36, 52];
  }

  #ensureCorrectGameType(gameType: string): asserts gameType is GameType {
    assert.ok(this.#allowedGameType.includes(gameType), "Неверный тип игры");
  }

  get #allowedGameType() {
    return ["basic", "perevodnoy"];
  }

  ensureEnoughCardsForUsers(cardCount: number, userCount: number) {
    assert.ok(cardCount >= userCount * GOOD_CARD_AMOUNT);
  }
}