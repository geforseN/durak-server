import assert from "node:assert";
import { expect, it, describe } from "vitest";

import type Player from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

import { Hand } from "@/module/DurakGame/entity/Deck/index.js";
import { Attacker } from "@/module/DurakGame/entity/Player/Attacker.js";
import { Defender } from "@/module/DurakGame/entity/Player/Defender.js";
import { Players } from "@/module/DurakGame/entity/Players/Players.js";

describe("test BasePlayer#enemies", () => {
  describe("method work correct when BasePlayer called exitGame", () => {
    const playersData: [number, Player, number][] = [
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
      expect(dog.enemies).toEqual([
        cat.toEnemy(),
        fox.toEnemy(),
      ]);
    });

    it("after cat.exitGame dog.enemies work correct", () => {
      expect(dog.left).toBe(cat);
      cat.exitGame();
      expect(dog.left).toBe(fox);
      expect(dog.enemies).toEqual([cat.toEnemy(), fox.toEnemy()]);
      expect(cat.hasLeftTheGame).toBe(true);
    });
    it("after fox.exitGame dog.enemies work correct", () => {
      fox.exitGame();
      expect(dog.left).toBe(dog);
      expect(dog.enemies).toEqual([cat.toEnemy(), fox.toEnemy()]);
      expect(fox.hasLeftTheGame).toBe(true);
    });
  });
});
