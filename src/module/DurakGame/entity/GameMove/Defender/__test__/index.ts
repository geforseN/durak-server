import test from "node:test";
import assert from "node:assert";
import Card, { Suit, TrumpCard } from "../../../Card";
import getDefenseStrategy from "../getDefenseStrategy";

test.describe("trump cards check", () => {
  const suit: Suit = "♠";
  test.it("throw when defender has weaker trump cards", () => {
    assert.throws(
      () => {
        getDefenseStrategy(
          [
            new TrumpCard({ rank: "10", suit }),
            new TrumpCard({ rank: "4", suit }),
          ],
          [
            new TrumpCard({ rank: "J", suit }),
            new TrumpCard({ rank: "2", suit }),
          ],
          suit,
        );
      },
      { message: "Defender trump card could not defend desk trump card" },
    );
  });

  test.todo(
    "throw when there is no unbeaten v cards" +
      "(when no unbeaten cards, then find player who can put card on desk." +
      "if no one found then defender won defense",
    () => {
      assert.doesNotThrow(() => {
        getDefenseStrategy([], [], suit);
      });
    },
  );

  test.it("defend with lowest trump cards", () => {
    assert.doesNotThrow(() => {
      const { defenseStrategy, remainingDefenderTrumpCards } =
        getDefenseStrategy(
          [
            new TrumpCard({ rank: "J", suit }),
            new TrumpCard({ rank: "6", suit }),
            new TrumpCard({ rank: "9", suit }),
            new TrumpCard({ rank: "K", suit }),
            new TrumpCard({ rank: "A", suit }),
          ],
          [
            new TrumpCard({ rank: "Q", suit }),
            new TrumpCard({ rank: "8", suit }),
          ],
          suit,
        );
      assert.strictEqual(remainingDefenderTrumpCards.length, 3);
      assert.notDeepStrictEqual(remainingDefenderTrumpCards, [
        new TrumpCard({ rank: "A", suit }),
        new TrumpCard({ rank: "6", suit }),
        new TrumpCard({ rank: "J", suit }),
      ]);
      assert.deepStrictEqual(defenseStrategy, [
        {
          deskCard: new TrumpCard({ rank: "Q", suit: suit }),
          defenderCard: new TrumpCard({ rank: "K", suit }),
        },
        {
          deskCard: new TrumpCard({ rank: "8", suit: suit }),
          defenderCard: new TrumpCard({ rank: "9", suit }),
        },
      ]);
    });
  });
});
