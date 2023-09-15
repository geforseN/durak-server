import { test, describe, beforeEach, it, expect } from "vitest";
import assert from "node:assert";
import DurakGame from "./DurakGame.js";
import NonStartedDurakGame from "./NonStartedDurakGame.js";
import Lobby from "../Lobbies/entity/Lobby.js";
import { GameSettings } from "@durak-game/durak-dts";
import EventEmitter from "node:events";
import LobbySlots from "../Lobbies/entity/LobbySlots.js";
import LobbyUser from "../Lobbies/entity/LobbyUser.js";
import { BasePlayer } from "./entity/Player/BasePlayer.abstract.js";
import { makeMagic } from "./socket/handler/makeMagic.js";

const socketIO__stub = {
  emit() {},
  to: () => {
    return {
      emit: () => {},
    };
  },
  except: () => {
    return {
      emit: () => {},
    };
  },
};

const defaultLobbySettings: GameSettings = {
  cardCount: 36,
  desk: {
    allowedFilledSlotCount: 6,
    slotCount: 6,
  },
  gameType: "perevodnoy",
  initialDistribution: { cardCountPerIteration: 2, finalCardCount: 6 },
  moveTime: 2147483647,
  userCount: 2,
};

describe(
  "Проверка логики игры для двух игроков",
  async (a) => {
    beforeEach((test) => console.log(`about to run "${test.task.name}"`));

    const lobby = new Lobby(defaultLobbySettings, new EventEmitter());
    lobby.slots = new LobbySlots(defaultLobbySettings.userCount);
    lobby.insertUser(new LobbyUser({ id: "11" }), 0);
    lobby.insertUser(new LobbyUser({ id: "2222" }), 1);

    assert.ok(lobby.isFull);

    const nonStartedDurakGame = new NonStartedDurakGame(lobby);
    await BasePlayer.configureDependencies();
    const game = new DurakGame(nonStartedDurakGame, socketIO__stub);

    assert.ok(game.info.status === "started");

    it("card is dropped by attacker", async (test) => {
      // testContext.diagnostic("1");
      const attacker = game.players.attacker;
      assert.strictEqual(game.players.attacker, attacker);
      assert.ok(attacker.isAllowed());
      const cardToDrop = game.players.attacker.hand.get(
        (_, index) => index === 0,
      );
      console.log("i2j3i12joi31j2312j3p1o2ij12p3k1p2312po3k12po312");
      expect(game.players.attacker.hand.count).toBe(6);
      makeMagic.call(
        { game },
        await attacker.makeInsertMove(cardToDrop, game.desk.slotAt(0)),
      );

      assert.notStrictEqual(game.players.attacker, attacker);
      assert.strictEqual(game.players.attacker.hand.count, 5);
    });

    console.log("33");
    console.log(" _");

    it("after attacker stop move attacker is disallowed and defender is allowed", () => {
      const attackerAfterInsert = game.players.attacker;

      assert.ok(attackerAfterInsert.isAllowed());
      const attackerStopMove = attackerAfterInsert.makeStopMove();

      makeMagic.call({ game }, attackerStopMove);
      console.log(22);
      const attackerAfterStop = game.players.attacker;
      assert.ok(attackerAfterStop == game.players.attacker);
      assert.ok(attackerAfterStop !== attackerAfterInsert);
      assert.ok(!attackerAfterStop.isAllowed());
      console.log(game.players.allowedPlayer.kind);
      console.log(222);

      const defender = game.players.defender;
      assert.ok(defender.isAllowed());
    });
    console.log("99");
  },
  { timeout: 5_000 },
);
