import { describe, beforeEach, it } from "vitest";
import assert from "node:assert";
import DurakGame from "./DurakGame.js";
import NonStartedDurakGame from "./NonStartedDurakGame.js";
import Lobby from "../Lobbies/entity/Lobby.js";
import { Card, GameSettings } from "@durak-game/durak-dts";
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


const defaultLobbySettings: GameSettings = {
  talon: {
    count: 36,
    trumpCard: { rank: "4", suit: "♣" },
  },
  players: {
    count: 2,
    moveTime: 2147483647,
  },
  desk: {
    allowedFilledSlotCount: 6,
    slotCount: 6,
  },
  type: "perevodnoy",
  initialDistribution: { cardCountPerIteration: 2, finalCardCount: 6 },
};

await BasePlayer.configureDependencies();

function createDurakGameWithPlayers(
  ...playersLike: { id: string; cards: Card[] }[]
) {
  const lobby = new Lobby(
    {
      ...defaultLobbySettings,
      players: {
        count: playersLike.length,
      },
    },
    new EventEmitter(),
  );
  playersLike.forEach((player, index) => {
    lobby.insertUser(new LobbyUser({ id: player.id }, player.cards), index);
  });
  assert.ok(lobby.isFull);
  const nonStartedDurakGame = new NonStartedDurakGame(lobby);
  const game = new DurakGame(nonStartedDurakGame, socketIO__stub);
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

  it.todo("", () => {});
});
