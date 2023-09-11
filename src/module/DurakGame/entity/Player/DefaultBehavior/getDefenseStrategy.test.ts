import test from "node:test";
import assert from "node:assert";
import Card, { Suit } from "../../Card/index.js";
import { TrumpCard } from "../../Card/TrumpCard.js";
import getDefenseStrategy, { cardsSort, slotsSort } from "./getDefenseStrategy.js";

const TRUMP_SUIT: Suit = "♠" as const;
const WEAK_SUITS: Record<
  Exclude<Suit, typeof TRUMP_SUIT>,
  Exclude<Suit, typeof TRUMP_SUIT>
> = {
  "♣": "♣",
  "♦": "♦",
  "♥": "♥",
} as const;
let logger: { log: Function } | undefined = undefined;

test.describe("trump cards check", { concurrency: true }, () => {
  test.it("throw when defender has weaker trump cards", () => {
    assert.throws(
      () => {
        getDefenseStrategy(
          [
            new TrumpCard({ rank: "10", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "4", suit: TRUMP_SUIT }),
          ],
          [
            new TrumpCard({ rank: "J", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "2", suit: TRUMP_SUIT }),
          ],
        );
      },
      { message: "Defender trump card could not defend desk trump card" },
    );
  });
  test.describe("defense of trump unbeaten cards with best trump cards", () => {
    assert.doesNotThrow(() => {
      const { defenseStrategy, remainingDefenderTrumpCards } =
        getDefenseStrategy(
          [
            new TrumpCard({ rank: "J", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "6", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "9", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "K", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "A", suit: TRUMP_SUIT }),
          ],
          [
            new TrumpCard({ rank: "Q", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "8", suit: TRUMP_SUIT }),
          ],
        );

      test.it("correct remained defender trump cards count", () => {
        assert.strictEqual(remainingDefenderTrumpCards.length, 3);
      });

      test.it("remained defender trump cards are best", () => {
        assert.deepStrictEqual(
          [...remainingDefenderTrumpCards].sort(cardsSort),
          [
            new TrumpCard({ rank: "A", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "6", suit: TRUMP_SUIT }),
            new TrumpCard({ rank: "J", suit: TRUMP_SUIT }),
          ].sort(cardsSort),
        );
      });

      test.it("defense strategy contains best cards", () => {
        assert.deepStrictEqual(
          [...defenseStrategy].sort(slotsSort),
          [
            {
              attackCard: new TrumpCard({ rank: "Q", suit: TRUMP_SUIT }),
              defendCard: new TrumpCard({ rank: "K", suit: TRUMP_SUIT }),
            },
            {
              attackCard: new TrumpCard({ rank: "8", suit: TRUMP_SUIT }),
              defendCard: new TrumpCard({ rank: "9", suit: TRUMP_SUIT }),
            },
          ].sort(slotsSort),
        );
      });
    });
  });
});

test.describe("throw on wrong data", () => {
  test.todo(
    "throw when there is no unbeaten v cards" +
      "(when no unbeaten cards, then find player who can put card on desk." +
      "if no one found then defender won defense",
    () => {
      assert.doesNotThrow(() => {
        getDefenseStrategy([], []);
      });
    },
  );
});

test.describe("bsd", { concurrency: true }, () => {
  const { defenseStrategy, remainingDefenderTrumpCards } = getDefenseStrategy(
    [
      new TrumpCard({ rank: "Q", suit: TRUMP_SUIT }),
      new TrumpCard({ rank: "9", suit: TRUMP_SUIT }),
      new TrumpCard({ rank: "K", suit: TRUMP_SUIT }),
      new Card({ rank: "J", suit: WEAK_SUITS["♦"] }),
      new Card({ rank: "K", suit: WEAK_SUITS["♥"] }),
    ],
    [
      new TrumpCard({ rank: "10", suit: TRUMP_SUIT }),
      new TrumpCard({ rank: "8", suit: TRUMP_SUIT }),
      new Card({ rank: "A", suit: WEAK_SUITS["♥"] }),
      new Card({ rank: "10", suit: WEAK_SUITS["♦"] }),
      new Card({ rank: "Q", suit: WEAK_SUITS["♥"] }),
    ],
    logger,
  );

  test.it("correct remained defender trump cards count", () => {
    assert.strictEqual(remainingDefenderTrumpCards.length, 0);
  });

  test.it("defense strategy contains best cards", () => {
    assert.deepStrictEqual(
      [...defenseStrategy].sort(slotsSort),
      [
        {
          attackCard: new Card({ rank: "Q", suit: WEAK_SUITS["♥"] }),
          defendCard: new Card({ rank: "K", suit: WEAK_SUITS["♥"] }),
        },
        {
          attackCard: new Card({ rank: "A", suit: WEAK_SUITS["♥"] }),
          defendCard: new TrumpCard({ rank: "K", suit: TRUMP_SUIT }),
        },
        {
          attackCard: new TrumpCard({ rank: "10", suit: TRUMP_SUIT }),
          defendCard: new TrumpCard({ rank: "Q", suit: TRUMP_SUIT }),
        },
        {
          attackCard: new TrumpCard({ rank: "8", suit: TRUMP_SUIT }),
          defendCard: new TrumpCard({ rank: "9", suit: TRUMP_SUIT }),
        },
        {
          attackCard: new Card({ rank: "10", suit: WEAK_SUITS["♦"] }),
          defendCard: new Card({ rank: "J", suit: WEAK_SUITS["♦"] }),
        },
      ].sort(slotsSort),
    );
  });
});
