import { Card } from "@/module/DurakGame/entity/index.js";
import { describe, expect, test } from "vitest";

// import DurakGame from "@/module/DurakGame/DurakGame.js";
// import StartingDurakGame from "./StartingDurakGame.js";

// new StartingDurakGame()

// const game = DurakGame.create("123", {
//   desk: {
//     allowedFilledSlotCount: 6,
//     slotCount: 6,
//   },
//   initialDistribution: {
//     cardCountPerIteration: 6,
//     finalCardCount: 6
//   },
//   players: {
//     count: 2,
//     moveTime: Number.POSITIVE_INFINITY
//   },
//   talon: {
//     count: 36
//   },
//   type: 'podkidnoy'
// });
// expect(game)
//  2 players - 24 cards

const FOX_ID = "fox";

const RABBIT_ID = "rabbit";

const players = [
  {
    id: FOX_ID,
  },
  {
    id: RABBIT_ID,
  },
];

describe("durak-game", () => {
  describe("2 players, 24 cards", () => {
    const game = {
      players,
    };

    describe("first move", () => {
      test("throws on defender move attempt", () => {
        expect(() => {
          game.with(new moves.Stop(RABBIT_ID, Card.create("7", "♣"), 0));
        }).toThrowErrorMatchingInlineSnapshot();

        expect(() => {
          game.with(new moves.CardPlace(RABBIT_ID, Card.create("7", "♣"), 0));
        }).toThrowErrorMatchingInlineSnapshot();
      });
      test("allows attacker move", () => {
        expect(() => {
          game.with(new moves.CardPlace(FOX_ID, Card.create("7", "♣"), 0));
        }).not.toThrow();
      });
    });
  });
});
