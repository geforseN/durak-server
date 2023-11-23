import assert from "node:assert";
import { describe } from "node:test";
import { expect, it } from "vitest";

import type { BasePlayer } from "../Player/BasePlayer.abstract.js";

import { Hand } from "../Deck/index.js";
import { Attacker } from "../Player/Attacker.js";
import { Defender } from "../Player/Defender.js";
import { Player } from "../Player/Player.js";
import { Players } from "./Players.js";

describe("test BasePlayer#enemies ", () => {
  describe("method work correct when BasePlayer called exitGame", () => {
    const playersData: [number, BasePlayer, number][] = [
      // @ts-expect-error no need more data, only id in info is required
      [1, new Attacker({ hand: new Hand(), info: { id: "dog" } }), 2],
      // @ts-expect-error no need more data, only id in info is required
      [2, new Defender({ hand: new Hand(), info: { id: "cat" } }), 0],
      // @ts-expect-error no need more data, only id in info is required
      [0, new Player({ hand: new Hand(), info: { id: "fox" } }), 1],
    ];
    const players = playersData.map((data) => data[1]);
    playersData.forEach(([leftIndex, player, rightIndex]) => {
      player.addSidePlayers(players[leftIndex], players[rightIndex]);
    });

    const gamePlayers = new Players(players);
    const dog = gamePlayers.get((p) => p.id === "dog");
    const cat = gamePlayers.get((p) => p.id === "cat");
    const fox = gamePlayers.get((p) => p.id === "fox");

    it("left and right properties work correct after creation", () => {
      assert.ok(dog.left === cat);
      assert.ok(dog.right === fox);
      assert.ok(cat.left === fox);
      assert.ok(cat.right === dog);
      assert.ok(fox.left === dog);
      assert.ok(fox.right === cat);
    });

    it("dog.enemies work correct", () => {

      expect(dog.enemies).to.have.deep.ordered.members([
        cat.toEnemy(),
        fox.toEnemy(),
      ]);
    });

    it("after cat.exitGame dog.enemies work correct", () => {
      expect(dog.left).toBe(cat);

      cat.exitGame();

      expect(dog.left).toBe(fox);
      expect(dog.enemies).to.have.deep.ordered.members([
        cat.toEnemy(),
        fox.toEnemy(),
      ]);
      expect(cat.hasLeftTheGame === true);
    });
    it("after fox.exitGame dog.enemies work correct", () => {
      fox.exitGame();

      expect(dog.left).toBe(dog);
      expect(dog.enemies).to.have.deep.ordered.members([
        cat.toEnemy(),
        fox.toEnemy(),
      ]);
      expect(fox.hasLeftTheGame === true);
    });
  });
});
