import type {
  Card as CardDTO,
  GameSettings,
  TalonCardCount,
} from "@durak-game/durak-dts";

import { describe, expect, it, test } from "vitest";

import TrumpCard from "../../Card/TrumpCard.js";
import { Card } from "../../index.js";
import buildTalon from "./buildTalon.js";

describe("buildTalon work good", () => {
  test.each([0, 1, -36, 54])("throws on wrong count=%i", (count) => {
    expect(() => {
      buildTalon({ count: count as TalonCardCount });
    }).toThrow();
  });

  test.each<TalonCardCount>([24, 36, 52])(
    "correctly builded with count=%i",
    (count) => {
      expect(buildTalon({ count })).toHaveLength(count);
    },
  );

  const trumpCard: CardDTO = { rank: "10", suit: "♠" };

  const TALON_SETTINGS: GameSettings["talon"][] = [
    { count: 24, trumpCard },
    { count: 36, trumpCard },
    { count: 52, trumpCard },
  ];

  TALON_SETTINGS.forEach(({ count, trumpCard }) => {
    let talonCards: ReturnType<typeof buildTalon>;
    expect(() => {
      talonCards = buildTalon({ count, trumpCard });
    }).not.toThrow();

    describe("given trump card are correct in talon cards", () => {
      it("has trump card as most bottom card", () => {
        expect(talonCards[0]).toEqual({
          isTrump: true,
          power: expect.any(Number),
          ...trumpCard,
        });
      });

      it("is instance of TrumpCard", () => {
        expect(talonCards[0]).toBeInstanceOf(TrumpCard);
      });

      it(`deck has right amount of trump cards=${
        count / Card.suits.length
      }`, () => {
        expect(talonCards.filter((card) => card.isTrump)).toHaveLength(
          count / Card.suits.length,
        );
      });
    });
  });
});
