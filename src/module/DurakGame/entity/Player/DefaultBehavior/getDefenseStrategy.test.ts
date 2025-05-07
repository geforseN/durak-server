import { describe, it } from "vitest";
import assert from "node:assert";
import Card, { Suit } from "@/module/DurakGame/entity/Card/index.js";
import TrumpCard from "@/module/DurakGame/entity/Card/trump-card.js";
import getDefenseStrategy, {
  cardsSort,
  slotsSort,
} from "@/module/DurakGame/entity/Player/DefaultBehavior/getDefenseStrategy.js";

const TRUMP_SUIT: Suit = "♠" as const;
const WEAK_SUITS: Record<
  Exclude<Suit, typeof TRUMP_SUIT>,
  Exclude<Suit, typeof TRUMP_SUIT>
> = {
  "♣": "♣",
  "♦": "♦",
  "♥": "♥",
} as const;

const logger = undefined;

describe("getDefenseStrategy", () => {
  describe("trump cards check", () => {
    it("throw when defender has weaker trump cards", () => {
      assert.throws(
        () => {
          getDefenseStrategy(
            [
              TrumpCard.create("10", TRUMP_SUIT),
              TrumpCard.create("4", TRUMP_SUIT),
            ],
            [
              TrumpCard.create("J", TRUMP_SUIT),
              TrumpCard.create("2", TRUMP_SUIT),
            ],
          );
        },
        { message: "Defender trump card could not defend desk trump card" },
      );
    });
  });

  describe("defense of trump unbeaten cards with best trump cards", () => {
    const { defenseStrategy, remainingDefenderTrumpCards } = getDefenseStrategy(
      [
        TrumpCard.create("J", TRUMP_SUIT),
        TrumpCard.create("6", TRUMP_SUIT),
        TrumpCard.create("9", TRUMP_SUIT),
        TrumpCard.create("K", TRUMP_SUIT),
        TrumpCard.create("A", TRUMP_SUIT),
      ],
      [TrumpCard.create("Q", TRUMP_SUIT), TrumpCard.create("8", TRUMP_SUIT)],
    );

    it("correct remained defender trump cards count", () => {
      assert.strictEqual(remainingDefenderTrumpCards.length, 3);
    });

    it("remained defender trump cards are best", () => {
      assert.deepStrictEqual(
        [...remainingDefenderTrumpCards].sort(cardsSort),
        [
          TrumpCard.create("A", TRUMP_SUIT),
          TrumpCard.create("6", TRUMP_SUIT),
          TrumpCard.create("J", TRUMP_SUIT),
        ].sort(cardsSort),
      );
    });

    it("defense strategy contains best cards", () => {
      assert.deepStrictEqual(
        [...defenseStrategy].sort(slotsSort),
        [
          {
            attackCard: TrumpCard.create("Q", TRUMP_SUIT),
            defendCard: TrumpCard.create("K", TRUMP_SUIT),
          },
          {
            attackCard: TrumpCard.create("8", TRUMP_SUIT),
            defendCard: TrumpCard.create("9", TRUMP_SUIT),
          },
        ].sort(slotsSort),
      );
    });
  });

  describe("defense of trump unbeaten cards with best trump cards 2", () => {
    const { defenseStrategy, remainingDefenderTrumpCards } = getDefenseStrategy(
      [
        TrumpCard.create("Q", TRUMP_SUIT),
        TrumpCard.create("9", TRUMP_SUIT),
        TrumpCard.create("K", TRUMP_SUIT),
        Card.create("J", WEAK_SUITS["♦"]),
        Card.create("K", WEAK_SUITS["♥"]),
      ],
      [
        TrumpCard.create("10", TRUMP_SUIT),
        TrumpCard.create("8", TRUMP_SUIT),
        Card.create("A", WEAK_SUITS["♥"]),
        Card.create("10", WEAK_SUITS["♦"]),
        Card.create("Q", WEAK_SUITS["♥"]),
      ],
      logger,
    );

    it("correct remained defender trump cards count", () => {
      assert.strictEqual(remainingDefenderTrumpCards.length, 0);
    });

    it("defense strategy contains best cards", () => {
      assert.deepStrictEqual(
        [...defenseStrategy].sort(slotsSort),
        [
          {
            attackCard: Card.create("Q", WEAK_SUITS["♥"]),
            defendCard: Card.create("K", WEAK_SUITS["♥"]),
          },
          {
            attackCard: Card.create("A", WEAK_SUITS["♥"]),
            defendCard: TrumpCard.create("K", TRUMP_SUIT),
          },
          {
            attackCard: TrumpCard.create("10", TRUMP_SUIT),
            defendCard: TrumpCard.create("Q", TRUMP_SUIT),
          },
          {
            attackCard: TrumpCard.create("8", TRUMP_SUIT),
            defendCard: TrumpCard.create("9", TRUMP_SUIT),
          },
          {
            attackCard: Card.create("10", WEAK_SUITS["♦"]),
            defendCard: Card.create("J", WEAK_SUITS["♦"]),
          },
        ].sort(slotsSort),
      );
    });
  });
});
