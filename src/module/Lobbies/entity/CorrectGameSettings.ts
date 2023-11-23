import assert from "node:assert";
import type {
  DurakGameType,
  GameSettings,
  PlayerCount,
  TalonCardCount,
  InitialGameSettings,
  CardDTO,
} from "@durak-game/durak-dts";

import { GOOD_CARD_AMOUNT } from "../../DurakGame/entity/Player/BasePlayer.abstract.js";

export type FrontendGameSettings = {
  cardCount: GameSettings["talon"]["count"];
  gameType: GameSettings["type"];
  moveTime: number;
  userCount: GameSettings["players"]["count"];
};

export default class CorrectGameSettings {
  desk: GameSettings["desk"];
  initialDistribution: GameSettings["initialDistribution"];
  players: GameSettings["players"];
  talon: GameSettings["talon"];
  type: GameSettings["type"];

  constructor({
    talonCardCount,
    gameType,
    moveTime = 15_000,
    trumpCard,
    playerCount,
  }: InitialGameSettings & { trumpCard?: CardDTO }) {
    this.players = {
      count: playerCount,
      moveTime,
    };
    this.talon = {
      count: talonCardCount,
      trumpCard,
    };
    this.type = gameType;
    this.initialDistribution = {
      cardCountPerIteration: 2,
      finalCardCount: 6,
    };
    this.desk = { allowedFilledSlotCount: 6, slotCount: 6 };
    this.#ensureCorrectUserCount(this.players.count);
    this.#ensureCorrectCardCount(this.talon.count);
    this.#ensureCorrectGameType(this.type);
    this.#ensureEnoughCardsForUsers(this.talon.count, this.players.count);
  }

  #ensureCorrectCardCount(
    cardCount: number,
  ): asserts cardCount is TalonCardCount {
    assert.ok([24, 36, 52].includes(cardCount), "Неверное количество карт");
  }

  #ensureCorrectGameType(gameType: string): asserts gameType is DurakGameType {
    assert.ok(["basic", "perevodnoy"].includes(gameType), "Неверный тип игры");
  }

  #ensureCorrectUserCount(userCount: number): asserts userCount is PlayerCount {
    assert.ok(
      [2, 3, 4, 5, 6].includes(userCount),
      "Нельзя создать лобби из менее двух или более шести игроков",
    );
  }

  #ensureEnoughCardsForUsers(cardCount: number, userCount: number) {
    assert.ok(cardCount >= userCount * GOOD_CARD_AMOUNT);
  }
}
