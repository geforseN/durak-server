import test from "node:test";
import DurakGame from "../DurakGame.js";
import NonStartedDurakGame from "../NonStartedDurakGame.js";
import Lobby from "../../Lobbies/entity/Lobby.js";
import EventEmitter from "node:events";

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
