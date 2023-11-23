import type {
  CardDTO,
  DurakGameSocket,
  GameSettings,
} from "@durak-game/durak-dts";

import assert from "node:assert";
import EventEmitter from "node:events";
import { beforeEach, describe, expect, it, test } from "vitest";

import Lobby from "../Lobbies/entity/Lobby.js";
import LobbyUser from "../Lobbies/entity/LobbyUser.js";
import DurakGame from "./DurakGame.js";
import NonStartedDurakGame from "./NonStartedDurakGame.js";
import DeskSlots from "./entity/DeskSlots/index.js";
import DefenderGaveUpMove from "./entity/GameMove/DefenderGaveUpMove.js";
import TransferMove from "./entity/GameMove/DefenderTransferMove.js";
import {
  InsertAttackCardMove,
  StopAttackMove,
} from "./entity/GameMove/index.js";
import { BasePlayer } from "./entity/Player/BasePlayer.abstract.js";
import getDefenseStrategy from "./entity/Player/DefaultBehavior/getDefenseStrategy.js";
import { Card } from "./entity/index.js";

const namespaceSocketIONoop = {
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
  },
  type: "perevodnoy",
};

await BasePlayer.configureDependencies();

const suits = {
  trump: "♣",
  "♠": "♠",
  "♥": "♥",
  "♦": "♦",
} as const;
const trumpCard: CardDTO = { rank: "9", suit: suits["trump"] } as const;

function createDurakGame({
  deskValues,
  players,
  settings = {},
  shouldGiveRequiredCards,
  shouldMakeInitialDistribution,
  shouldStartRightNow,
  trumpCard,
}: {
  deskValues?: [number, Card?, Card?][];
  players: { cards?: CardDTO[]; id: string }[];
  settings?: Partial<GameSettings>;
  shouldGiveRequiredCards?: boolean;
  shouldMakeInitialDistribution?: boolean;
  shouldStartRightNow?: boolean;
  trumpCard?: CardDTO;
}) {
  const gameSettings = { ...defaultLobbySettings, ...settings };
  trumpCard ??= gameSettings.talon.trumpCard;
  const lobby = new Lobby(
    {
      talonCardCount: gameSettings.talon.count,
      gameType: gameSettings.type,
      moveTime: gameSettings.players.moveTime,
      trumpCard: gameSettings.talon.trumpCard,
      playerCount: gameSettings.players.count,
    },
    new EventEmitter(),
  );
  // NOTE: the first player is admin of lobby
  // NOTE: IF game logic of define first attacker did not changed THEN
  // - the first player will be attacker
  // - the second player will be defender
  players.forEach((player, index) => {
    // @ts-expect-error no need more data, only id is required
    lobby.insertUser(new LobbyUser({ id: player.id }, player.cards), index);
  });
  if (trumpCard) {
    players.forEach((player) => {
      if (!player.cards) {
        return;
      }
      if (
        player.cards.some(
          (card) =>
            card.rank === trumpCard!.rank && card.suit === trumpCard!.suit,
        )
      ) {
        throw {
          message:
            "player card has main trump card on game creation, which is not ok for later logic of test",
          playerCards: player.cards,
          trumpCard,
        };
      }
    });
  }
  assert.ok(lobby.isFull);
  const nonStartedDurakGame = new NonStartedDurakGame(lobby);
  const game = new DurakGame(nonStartedDurakGame, namespaceSocketIONoop, {
    shouldBeUsedOnlyForTest: true,
    shouldGiveRequiredCards,
    shouldMakeInitialDistribution,
    shouldStartRightNow,
    shouldWriteEndedGameInDatabase: false,
  });
  if (deskValues) {
    game.desk._slots = DeskSlots.__test_only_deskSlots(deskValues);
  }
  if (shouldMakeInitialDistribution) {
    [...game.players].forEach((player) => {
      assert.ok(
        player.hand.count === game.settings.initialDistribution.finalCardCount,
      );
    });
  }
  if (shouldStartRightNow) {
    assert.ok(game.info.status === "started");
  }
  return game;
}

describe("Проверка логики игры для двух игроков", () => {
  beforeEach((test) => console.log(`about to run "${test.task.name}"`));

  it.todo("throw when defender puts wrong card", () => {
    it.todo("case 1", () => {});
    it.todo("case 2", () => {});
    it.todo("defender tries to put not trump card on trump card", () => {});
    it.todo("defender put", () => {});
  });
  describe("THIS IS IT", () => {
    const game = createDurakGame({
      players: [
        {
          cards: [
            { rank: "10", suit: "♥" },
            { rank: "7", suit: "♥" },
            { rank: "J", suit: "♥" },
            { rank: "9", suit: "♣" },
            { rank: "7", suit: "♠" },
            { rank: "10", suit: "♠" },
          ],
          id: "dog",
        },
        {
          cards: [
            { rank: "6", suit: "♣" },
            { rank: "6", suit: "♥" },
            { rank: "8", suit: "♦" },
            { rank: "Q", suit: "♦" },
            { rank: "10", suit: "♣" },
            { rank: "Q", suit: "♣" },
          ],
          id: "cat",
        },
      ],
      settings: {
        talon: {
          count: 36,
          trumpCard: { rank: "8", suit: "♥" },
        },
      },
    });
    test("dog first move 0♠ ok", async () => {
      const { allowed, attacker } = game.players;
      assert.strict.equal(attacker, allowed);
      expect(attacker.id).equal("dog");
      await attacker.makeNewMove("0♠", 0);
      expect(game.round.moves.latest).instanceOf(InsertAttackCardMove);
      assert.strict.notEqual(attacker, game.players.attacker);
    });
    test("dog second move stop ok", async () => {
      const { allowed, attacker } = game.players;
      assert.strict.equal(attacker, allowed);
      expect(attacker.id).equal("dog");
      await attacker.makeNewMove();
      expect(game.round.moves.latest).instanceOf(StopAttackMove);
      assert.strict.notEqual(attacker, game.players.attacker);
    });
    test("cat first move transfer 0♣ ok", async () => {
      const { allowed, defender } = game.players;
      assert.strict.equal(defender, allowed);
      expect(defender.id).equal("cat");
      await defender.makeNewMove("0♣", 1);
      expect(game.round.moves.latest).instanceOf(TransferMove);
      assert.strict.notEqual(defender, game.players.defender);
    });
    test("cat second move stop ok", async () => {
      const { allowed, attacker } = game.players;
      assert.strict.equal(attacker, allowed);
      expect(attacker.id).equal("cat");
      await attacker.makeNewMove();
      expect(game.round.moves.latest).instanceOf(StopAttackMove);
      assert.strict.notEqual(attacker, game.players.attacker);
    });
    test("dog third move 0♥ (trump suit) transfer ok", async () => {
      const { allowed, defender } = game.players;
      assert.strict.equal(defender, allowed);
      expect(defender.id).equal("dog");
      await defender.makeNewMove("0♥", 2);
      expect(game.round.moves.latest).instanceOf(TransferMove);
      assert.strict.notEqual(defender, game.players.attacker);
    });
    test("dog fourth move stop ok", async () => {
      const { allowed, attacker } = game.players;
      assert.strict.equal(attacker, allowed);
      expect(attacker.id).equal("dog");
      await attacker.makeNewMove();
      expect(game.round.moves.latest).instanceOf(StopAttackMove);
      assert.strict.notEqual(attacker, game.players.attacker);
    });
    test("cat can not really win", async () => {
      const { allowed, defender } = game.players;
      assert.strict.equal(defender, allowed);
      expect(defender.id).equal("cat");
      expect(() =>
        getDefenseStrategy([...defender.hand], game.desk.unbeatenSlots.cards),
      ).toThrow("Defender trump card could not defend desk trump card");
    });
    test("cat third move stop ok", async () => {
      const { allowed, defender } = game.players;
      assert.strict.equal(defender, allowed);
      expect(defender.id).equal("cat");
      await defender.makeNewMove();
      expect(game.round.moves.latest).instanceOf(DefenderGaveUpMove);
      const newDefender = game.players.defender;
      assert.strict.notEqual(defender, newDefender);
      // NOTE: i wish defender can have isSurrendered method or property
      // but because of bugs in code logic is changed and isSurrender do not exist
      // for better code it should be added later
      // TODO: Defender#isSurrendered
      // assert.ok(newDefender.isSurrendered());
    });
    test("dog can not really pursuit move", () => {
      const { allowed, attacker } = game.players;
      assert.strict.equal(attacker, allowed);
      const deskRanks = [...game.desk.ranks];
      expect(deskRanks).lengthOf(1);
      expect(() => {
        attacker.hand.get((card) => card.rank === deskRanks[0]);
      }).toThrow("У вас нет такой карты");
    });
    test(
      "dog stop move should lead to: " +
        "1) push desk cards to defender " +
        "2) dog again allowed to move",
      async () => {
        const { allowed, attacker, defender } = game.players;
        assert.strict.equal(attacker, allowed);
        const deckCards = game.desk._slots.cards;
        expect(game.round.number).toBe(1);
        const defenderCardCountBeforeDistribution = defender.hand.count;
        const newDefenderCardCount =
          deckCards.length + defenderCardCountBeforeDistribution;
        expect(newDefenderCardCount).equals(8);
        await attacker.makeNewMove();
        expect(() => game.round.moves.latest).toThrow(
          "No one yet done a single move in current round",
        );
        const { attacker: newRoundAttacker, defender: newRoundDefender } =
          game.players;
        expect(game.round.number).toBe(2);
        expect(newRoundAttacker.hand.count).equal(6);
        expect(newRoundAttacker.missingNumberOfCards).equal(0);
        // FIXME: commented line below never end the code
        // expect(newRoundDefender).toBe(defender)
        // same thing with assert.strict.equal
        // so used line below instead
        assert.ok(newRoundDefender !== defender);
        // NOTE: the expect below will work because
        // card distribution will happened on the end of first round
        // so past defender received card from desk and then new defender created
        expect(newRoundDefender.hand.count).equal(defender.hand.count);
        expect(newRoundDefender.hand.count).equals(newDefenderCardCount);
        assert.strict.equal(newRoundAttacker, game.players.allowed);
      },
    );
  });
  describe("throw when attacker puts card with wrong rank", () => {
    const setupGame = () => {
      return createDurakGame({
        players: [
          {
            cards: [
              { rank: "10", suit: suits.trump },
              { rank: "J", suit: suits.trump },
            ],
            id: "cat",
          },
          {
            cards: [
              { rank: "J", suit: suits.trump },
              { rank: "Q", suit: suits.trump },
            ],
            id: "dog",
          },
        ],
        settings: {
          talon: {
            ...defaultLobbySettings.talon,
            trumpCard,
          },
        },
        shouldMakeInitialDistribution: false,
      });
    };

    it("put card of rank 10, then J rank throws", async () => {
      const game = setupGame();
      [...game.players].forEach((player) => {
        expect(player.hand.count).toBe(2);
      });
      const { allowed, attacker } = game.players;
      assert.strictEqual(attacker, allowed);
      game.handleNewMove(await attacker._makeMove(`${"0"}${suits.trump}`, 0));
      const { allowed: allowed2, attacker: attacker2 } = game.players;
      assert.notStrictEqual(attacker, allowed2);
      assert.strictEqual(attacker2, allowed2);
      await expect(
        async () => await attacker.makeNewMove(`J${suits.trump}`, 1),
      ).rejects.toThrow("Нет схожего ранга на доске");
    });
    it("att, def, bad att", async () => {
      const game = setupGame();
      [...game.players].forEach((player) => {
        expect(player.hand.count).toBe(2);
      });
      const { allowed, attacker } = game.players;
      assert.strictEqual(attacker, allowed);
      game.handleNewMove(
        await attacker._makeMove({ rank: "10", suit: suits.trump }, 0),
      );
      const { allowed: allowed2, attacker: attacker2 } = game.players;
      assert.notStrictEqual(allowed2, attacker);
      assert.strictEqual(attacker2, allowed2);
      // expect(async () =>
      //   game.handleNewMove(await attacker.makeMove()),
      // ).resolves.toBeTruthy();
      game.handleNewMove(await attacker2._makeMove());
      const { allowed: allowed3, defender } = game.players;
      assert.strictEqual(defender, allowed3);
      // game.handleNewMove(
      //   await defender.makeInsertMove(
      //     defender.hand.get((card) =>
      //       card.hasSame({ rank: "Q", suit: suits.trump })
      //     ),
      //     game.desk.slotAt(0)
      //   ),
      // );
      game.handleNewMove(await defender._makeMove(`Q${suits.trump}`, 0));
      const { allowed: allowed4, attacker: attacker3 } = game.players;
      assert.strictEqual(attacker3, allowed4);
      await expect(async () => {
        await attacker3.makeNewMove(`J${suits.trump}`, 1);
      }).rejects.toThrow("Нет схожего ранга на доске");
    });
  });
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ddd!!!!!!!!!!

  it("attacker logic", async () => {
    it.todo("THIS IS COPY PASTE", async () => {
      const game = createDurakGame({
        players: [
          { cards: [{ rank: "J", suit: suits.trump }], id: "cat" },
          { cards: [{ rank: "10", suit: suits.trump }], id: "dog" },
        ],
        settings: {
          talon: {
            ...defaultLobbySettings.talon,
            trumpCard,
          },
        },
      });
      const { allowed, attacker } = game.players;
      assert.strictEqual(attacker, allowed);
      game.handleNewMove(
        await attacker._makeMove(
          game.players.attacker.hand.get((_, index) => index === 0),
          game.desk.slotAt(0),
        ),
      );
      expect(game.players.attacker).not.toBe(attacker);
    });
    it.todo(
      "throw when attacker wanna attack player which can not defend",
      () => {},
    );
  });

  describe("transfer move logic", () => {
    describe("disallow transfer move", () => {
      describe("no enough cards for left player", () => {
        const dog = {
          cards: [
            { rank: "10", suit: suits["♠"] },
            { rank: "10", suit: suits.trump },
            { rank: "8", suit: suits["♦"] },
          ] satisfies CardDTO[],
          id: "dog",
        };
        const cat = {
          cards: [
            { rank: "10", suit: suits["♦"] },
            { rank: "10", suit: suits["♥"] },
            { rank: "8", suit: suits["♥"] },
          ] satisfies CardDTO[],
          id: "cat",
        };
        const game = createDurakGame({
          players: [dog, cat],
          shouldMakeInitialDistribution: false,
          trumpCard,
        });
        it("dog first move 0♠ attack ok", async () => {
          const { allowed, attacker } = game.players;
          assert.strict.equal(attacker, allowed);
          expect(attacker.id).toBe("dog");
          await attacker.makeNewMove("0♠", 0);
          expect(game.round.moves.latest).instanceOf(InsertAttackCardMove);
        });
        it("dog second move stop ok", async () => {
          const { allowed, attacker } = game.players;
          assert.strict.equal(attacker, allowed);
          expect(attacker.id).toBe("dog");
          await attacker.makeNewMove();
          expect(game.round.moves.latest).instanceOf(StopAttackMove);
        });
        it("cat first move 0♦ transfer ok", async () => {
          const { allowed, defender } = game.players;
          assert.strict.equal(defender, allowed);
          expect(defender.id).toBe("cat");
          await defender.makeNewMove("0♦", 1);
          expect(game.round.moves.latest).instanceOf(TransferMove);
        });
        it("cat second move stop ok", async () => {
          const { allowed, attacker } = game.players;
          assert.strict.equal(attacker, allowed);
          expect(attacker.id).toBe("cat");
          await attacker.makeNewMove();
        });
        it("dog third move cat not make transfer because of card count of potential new defender", async () => {
          const { allowed, attacker, defender } = game.players;
          assert.strict.equal(defender, allowed);
          expect(defender.id).toBe("dog");
          expect(defender.hand.count).toBe(2);
          expect(attacker.hand.count).toBe(2);
          await expect(async () => {
            await defender.makeNewMove("0♣", 2);
          }).rejects.toThrow(
            "Player, to which you wanna transfer cards, has not enough card for defense. You must defend cards on desk",
          );
        });
      });
      // NOTE: 'real' defender is defender, which made InsertDefendCardMove, DefenderGaveUpMove
      // TODO add assert that no StopDefenseMove is fist move of 'real' defender (first move can be ether Insert or GiveUp)
      // TODO add test when player gets transfer moved and then GiveUp happen
      it.todo(
        "'real' defender is in game, so transfer move are not allowed anymore",
        () => {},
      );
      it.todo("wrong card for transfer move (wrong rank of card)", () => {});
    });

    it.todo("allows transfer move", () => {
      it.todo("case 1", () => {});
      it.todo("case 2", () => {});
    });
  });
  it.todo("last move of round works correct", () => {
    it.todo("game end when needed", () => {
    });
    it.todo("new round become when needed", () => {
    });
    it.todo("handle empty player correct", () => {
      it.todo("remove player from game when talon empty", () => {
      });
    });

    it.todo("do not remove player when talon has cards", () => {
    });
  });
  it("first scenario", () => {
    const game = createDurakGame({
      players: [{ id: "1" }, { id: "2" }],
    });

    it("card is dropped by attacker", async () => {
      const attacker = game.players.attacker;
      assert.ok(attacker.isAllowed());
      expect(attacker.isAllowed()).toBe(true);
      expect(game.players.attacker.hand.count).toBe(6);
      await attacker.makeNewMove(
        game.players.attacker.hand.get((_, index) => index === 0),
        0,
      );
      expect(game.players.attacker).not.toBe(attacker);
      expect(game.players.attacker.hand.count).toBe(5);
    });

    it("after attacker stop move attacker is disallowed and defender is allowed", ({
      expect,
    }) => {
      const attackerAfterInsert = game.players.attacker;
      assert.ok(attackerAfterInsert.isAllowed());

      attackerAfterInsert.makeNewMove();

      const attackerAfterStop = game.players.attacker;
      expect(attackerAfterStop).toBe(game.players.attacker);
      expect(attackerAfterStop).not.toBe(attackerAfterInsert);
      expect(attackerAfterStop.isAllowed()).toBeFalsy();

      const defender = game.players.defender;
      expect(defender.isAllowed()).toBeTruthy();
    });
  });

  it("second scenario", () => {
    const suits = {
      trump: "♠",
      "♣": "♣",
      "♥": "♥",
      "♦": "♦",
    } as const;
    const trumpCard: CardDTO = { rank: "K", suit: suits["trump"] };
    const game = createDurakGame({
      players: [
        { cards: [{ rank: "9", suit: suits["trump"] }], id: "cat" },
        { cards: [{ rank: "10", suit: suits["♣"] }], id: "dog" },
      ],
      settings: {
        talon: {
          ...defaultLobbySettings.talon,
          trumpCard,
        },
      },
      shouldMakeInitialDistribution: false,
      shouldStartRightNow: false,
    });

    expect(
      [...game.players].every((player) => player.hand.count === 0),
    ).toBeTruthy();

    game.start();

    expect(
      [...game.players].every((player) => player.hand.count === 1),
    ).toBeTruthy();

    expect(
      game.players
        .get((player) => player.id === "cat")
        .hand.get((_, index) => index === 0).isTrump,
    ).toBeTruthy();

    expect(
      [...game.players].every((player) => player.hand.count === 1),
    ).toBeTruthy();
  });

  it.todo("ended successfully when defender and talon is empty", () => {});
});
