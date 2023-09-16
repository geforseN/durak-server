import { Card, DurakGameSocket, GameSettings } from "@durak-game/durak-dts";
import { Suit } from "@durak-game/durak-dts";
import assert from "node:assert";
import EventEmitter from "node:events";
import { beforeEach, describe, it } from "vitest";

import Lobby from "../Lobbies/entity/Lobby.js";
import LobbyUser from "../Lobbies/entity/LobbyUser.js";
import DurakGame from "./DurakGame.js";
import NonStartedDurakGame from "./NonStartedDurakGame.js";
import { BasePlayer } from "./entity/Player/BasePlayer.abstract.js";
import { makeMagic } from "./socket/handler/makeMagic.js";

const namespaceStubOfSocketIO = {
  emit() {},
  except: () => {
    return {
      emit: () => {},
    };
  },
  to: () => {
    return {
      emit: () => {},
    };
  },
} as unknown as DurakGameSocket.Namespace;

const defaultLobbySettings: GameSettings = {
  desk: {
    allowedFilledSlotCount: 6,
    slotCount: 6,
  },
  initialDistribution: { cardCountPerIteration: 2, finalCardCount: 6 },
  players: {
    count: 2,
    moveTime: 2147483647,
  },
  talon: {
    count: 36,
    trumpCard: { rank: "4", suit: "♣" },
  },
  type: "perevodnoy",
};

await BasePlayer.configureDependencies();

function createDurakGame({
  gameSettings = {},
  players,
  shouldStartRightNow,
}: {
  gameSettings?: Partial<GameSettings>;
  players: { cards?: Card[]; id: string }[];
  shouldStartRightNow: boolean;
}) {
  const settings = { ...defaultLobbySettings, gameSettings };
  const lobby = new Lobby(
    {
      cardCount: settings.talon.count,
      gameType: settings.type,
      moveTime: settings.players.moveTime,
      userCount: settings.players.count,
    },
    new EventEmitter(),
  );
  players.forEach((player, index) => {
    lobby.insertUser(new LobbyUser({ id: player.id }, player.cards), index);
  });
  assert.ok(lobby.isFull);
  const nonStartedDurakGame = new NonStartedDurakGame(lobby);
  const game = new DurakGame(
    nonStartedDurakGame,
    namespaceStubOfSocketIO,
    shouldStartRightNow,
  );
  [...game.players].forEach((player) => {
    assert.ok(
      player.hand.count === game.settings.initialDistribution.finalCardCount,
    );
  });
  assert.ok(game.info.status === "started");
  return game;
}

describe("Проверка логики игры для двух игроков", async () => {
  beforeEach((test) => console.log(`about to run "${test.task.name}"`));

  it("first scenario", () => {
    const game = createDurakGame({
      players: [{ id: "1" }, { id: "2" }],
      shouldStartRightNow: true
    });

    it("card is dropped by attacker", async ({ expect }) => {
      const attacker = game.players.attacker;
      assert.ok(attacker.isAllowed());
      expect(attacker.isAllowed()).toStrictEqual(true);
      expect(game.players.attacker.hand.count).toBe(6);
      makeMagic.call(
        { game },
        await attacker.makeInsertMove(
          game.players.attacker.hand.get((_, index) => index === 0),
          game.desk.slotAt(0),
        ),
      );
      expect(game.players.attacker).not.toBe(attacker);
      expect(game.players.attacker.hand.count).toBe(5);
    });

    it("after attacker stop move attacker is disallowed and defender is allowed", ({
      expect,
    }) => {
      const attackerAfterInsert = game.players.attacker;
      assert.ok(attackerAfterInsert.isAllowed());

      makeMagic.call({ game }, attackerAfterInsert.makeStopMove());

      const attackerAfterStop = game.players.attacker;
      expect(attackerAfterStop).toBe(game.players.attacker);
      expect(attackerAfterStop).not.toBe(attackerAfterInsert);
      expect(attackerAfterStop.isAllowed()).toBeFalsy();

      const defender = game.players.defender;
      expect(defender.isAllowed()).toBeTruthy();
    });
  });

  it.todo("second scenario", () => {
    const trumpSuit: "♠" = "♠";
    const trumpCard: Card = { rank: "K", suit: trumpSuit };
    type nonTrumpSuit = Exclude<Suit, "♠">;
    const suits: Record<nonTrumpSuit, nonTrumpSuit> = {
      "♣": "♣",
      "♥": "♥",
      "♦": "♦",
    };
    const game = createDurakGame({
      gameSettings: {
        talon: {
          ...defaultLobbySettings.talon,
          trumpCard,
        },
      },
      players: [
        { cards: [{ rank: "9", suit: trumpSuit }], id: "cat" },
        { cards: [{ rank: "10", suit: suits["♣"] }], id: "dog" },
      ],
      shouldStartRightNow: false
    });
    game.start()

  });
});
