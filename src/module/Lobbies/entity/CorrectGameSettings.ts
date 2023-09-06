import assert from "node:assert";
import { GOOD_CARD_AMOUNT } from "../../DurakGame/entity/Player/BasePlayer.abstract";
import type {
  UserCount,
  GameType,
  CardCount,
  GameSettings,
} from "@durak-game/durak-dts";

export default class CorrectGameSettings {
  userCount: GameSettings["userCount"];
  gameType: GameSettings["gameType"];
  cardCount: GameSettings["cardCount"];
  moveTime: GameSettings["moveTime"];
  initialDistribution: GameSettings["initialDistribution"];
  desk: GameSettings["desk"];

  constructor({
    userCount,
    cardCount,
    gameType,
    moveTime = 15_000,
  }: GameSettings) {
    this.userCount = userCount;
    this.cardCount = cardCount;
    this.gameType = gameType;
    this.moveTime = moveTime;
    this.initialDistribution = {
      finalCardCount: 6,
      cardCountPerIteration: 2,
    };
    this.desk = { allowedFilledSlotCount: 6, slotCount: 6 };
    this.#ensureCorrectUserCount(this.userCount);
    this.#ensureCorrectCardCount(this.cardCount);
    this.#ensureCorrectGameType(this.gameType);
    this.ensureEnoughCardsForUsers(this.cardCount, this.userCount);
  }

  #ensureCorrectUserCount(userCount: number): asserts userCount is UserCount {
    assert.ok(
      [2, 3, 4, 5, 6].includes(userCount),
      "Нельзя создать лобби из менее двух или более шести игроков",
    );
  }

  #ensureCorrectCardCount(cardCount: number): asserts cardCount is CardCount {
    assert.ok([24, 36, 52].includes(cardCount), "Неверное количество карт");
  }

  #ensureCorrectGameType(gameType: string): asserts gameType is GameType {
    assert.ok(["basic", "perevodnoy"].includes(gameType), "Неверный тип игры");
  }

  ensureEnoughCardsForUsers(cardCount: number, userCount: number) {
    assert.ok(cardCount >= userCount * GOOD_CARD_AMOUNT);
  }
}
