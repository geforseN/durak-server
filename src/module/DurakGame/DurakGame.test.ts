import { describe, beforeEach, it } from "vitest";
import assert from "node:assert";
import DurakGame from "./DurakGame.js";
import NonStartedDurakGame from "./NonStartedDurakGame.js";
import Lobby from "../Lobbies/entity/Lobby.js";
import { GameSettings } from "@durak-game/durak-dts";
import EventEmitter from "node:events";
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

/**
 *  @property {number} moveTime - time in milliseconds, allowed to make move (the maximum value is 2147483647 due to the setTimeout maximum value of delay parameter)
 */
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

await BasePlayer.configureDependencies();

function createDurakGameWithPlayers(...playersLike: { id: string }[]) {
  const lobby = new Lobby(
    { ...defaultLobbySettings, userCount: playersLike.length },
    new EventEmitter(),
  );
  playersLike.forEach((player, index) => {
    lobby.insertUser(new LobbyUser({ id: player.id }), index);
  });
  assert.ok(lobby.isFull);
  const nonStartedDurakGame = new NonStartedDurakGame(lobby);
  const game = new DurakGame(nonStartedDurakGame, socketIO__stub);
  assert.ok(game.info.status === "started");
  return game;
}

describe("Проверка логики игры для двух игроков", async () => {
  beforeEach((test) => console.log(`about to run "${test.task.name}"`));

  const game = createDurakGameWithPlayers({ id: "1" }, { id: "2" });

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

  it('', () => {

  })
});
