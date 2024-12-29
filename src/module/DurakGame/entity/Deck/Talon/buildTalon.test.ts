import type {
  Card as CardDTO,
  GameSettings,
  TalonCardCount,
} from "@durak-game/durak-dts";

import { describe, expect, it, test } from "vitest";

import TrumpCard from "@/module/DurakGame/entity/Card/trump-card.js";
import { Card } from "@/module/DurakGame/entity/index.js";
import buildTalon from "@/module/DurakGame/entity/Deck/Talon/buildTalon.js";

describe("buildTalon", () => {
  test.each([0, 1, -36, 54])("throws on wrong count (%i)", (count) => {
    expect(() => {
      buildTalon({ count: count as TalonCardCount });
    }).toThrow();
  });

  test.each<TalonCardCount>([24, 36, 52])(
    "returns same number of cards for count=%i",
    (count) => {
      expect(buildTalon({ count })).toHaveLength(count);
    },
  );

  const trumpCard: CardDTO = { rank: "10", suit: "♠" };

  const TALON_SETTINGS = [
    { count: 24, trumpCard },
    { count: 36, trumpCard },
    { count: 52, trumpCard },
  ] as const satisfies GameSettings["talon"][];

  describe.each(TALON_SETTINGS)(
    "talon with count=%i and trump card=%o",
    (talonSettings) => {
      let talonCards: ReturnType<typeof buildTalon>;
      expect(() => {
        talonCards = buildTalon(talonSettings);
      }).not.toThrow();

      describe("most bottom card", () => {
        const talonTrumpCard = talonCards[0];
        it("has isTrump=true and number power", () => {
          expect(talonTrumpCard).toEqual({
            isTrump: true,
            power: expect.any(Number),
            ...trumpCard,
          });
        });

        it("is instance of TrumpCard", () => {
          expect(talonTrumpCard).toBeInstanceOf(TrumpCard);
        });
      });

      describe("trump cards", () => {
        const trumpCardsCount = talonSettings.count / Card.suits.length;
        it(`are in right amount (${trumpCardsCount})`, () => {
          const trumpCards = talonCards.filter((card) => card.isTrump);
          expect(trumpCards).toHaveLength(trumpCardsCount);
        });
      });
    },
  );
});
