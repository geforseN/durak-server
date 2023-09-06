import test from "node:test";
import assert from "node:assert";
import DurakGame from "../DurakGame";
import NonStartedDurakGame from "../NonStartedDurakGame";
import Lobby from "../../Lobbies/entity/Lobby";
import { EventEmitter } from "ws";

test.todo("asda", () => {
  const d = new DurakGame(
    new NonStartedDurakGame(
      new Lobby(
        {
          cardCount: 36,
          desk: { allowedFilledSlotCount: 6, slotCount: 6 },
          gameType: "perevodnoy",
          initialDistribution: { cardCountPerIteration: 2, finalCardCount: 6 },
          moveTime: 11010101,
          userCount: 2,
        },
        new EventEmitter(),
      ),
    ),
    {} as any
  );
});
