import assert from "node:assert";
import { GOOD_CARD_AMOUNT } from "../../DurakGame/entity/Player/BasePlayer.abstract.js";
import type {
  TalonCardCount,
  DurakGameType,
  PlayerCount,
  GameSettings,
  Card,
} from "@durak-game/durak-dts";

export type FrontendGameSettings = {
  userCount: GameSettings["players"]["count"];
  cardCount: GameSettings["talon"]["count"];
  gameType: GameSettings["type"];
  moveTime: number;
};

export default class CorrectGameSettings {
  players: GameSettings["players"];
  type: GameSettings["type"];
  talon: GameSettings["talon"];
  initialDistribution: GameSettings["initialDistribution"];
  desk: GameSettings["desk"];

  constructor(
    { userCount, cardCount, gameType, moveTime = 15_000 }: FrontendGameSettings,
    trumpCard?: Card,
  ) {
    this.players = {
      count: userCount,
      moveTime,
    };
    this.talon = {
      count: cardCount,
      trumpCard,
    };
    this.type = gameType;
    this.initialDistribution = {
      finalCardCount: 6,
      cardCountPerIteration: 2,
    };
    this.desk = { allowedFilledSlotCount: 6, slotCount: 6 };
    this.#ensureCorrectUserCount(this.players.count);
    this.#ensureCorrectCardCount(this.talon.count);
    this.#ensureCorrectGameType(this.type);
    this.#ensureEnoughCardsForUsers(this.talon.count, this.players.count);
  }

  #ensureCorrectUserCount(userCount: number): asserts userCount is PlayerCount {
    assert.ok(
      [2, 3, 4, 5, 6].includes(userCount),
      "Нельзя создать лобби из менее двух или более шести игроков",
    );
  }

  #ensureCorrectCardCount(
    cardCount: number,
  ): asserts cardCount is TalonCardCount {
    assert.ok([24, 36, 52].includes(cardCount), "Неверное количество карт");
  }

  #ensureCorrectGameType(gameType: string): asserts gameType is DurakGameType {
    assert.ok(["basic", "perevodnoy"].includes(gameType), "Неверный тип игры");
  }

  #ensureEnoughCardsForUsers(cardCount: number, userCount: number) {
    assert.ok(cardCount >= userCount * GOOD_CARD_AMOUNT);
  }
}
