import assert from "node:assert";
import GamePlayerWebsocketService from "./Player.service";
import { Attacker, Defender, Player, SuperPlayer } from "./index";

export default class Players {
  readonly #value: Player[];

  constructor(
    unstartedGamePlayers: Player[],
    wsPlayerService: GamePlayerWebsocketService,
  );
  constructor(players: Players);
  constructor(
    players: Players | Player[],
    wsPlayerService?: GamePlayerWebsocketService,
  ) {
    if (players instanceof Players) {
      this.#value = players.#value.reduce(
        (nonEmptyPlayers: Player[], player) => {
          if (player.hand.isEmpty) {
            player.exitGame();
          } else {
            nonEmptyPlayers.push(player);
          }
          return nonEmptyPlayers;
        },
        [],
      );
    } else if (wsPlayerService) {
      const unstartedGamePlayers = players;
      this.#value = unstartedGamePlayers.map(
        (player) => new Player(player, wsPlayerService),
      );
      this.#value = this.#value.map(
        (player, index, players) => new Player(player, index, players),
      );
    } else {
      throw new Error("Players constructor failure");
    }
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  get count() {
    return this.#value.length;
  }

  get attacker(): Attacker {
    return this.get<Attacker>(
      (player): player is Attacker => player instanceof Attacker,
      "Атакующий не найден",
    );
  }

  get defender(): Defender {
    return this.get<Defender>(
      (player): player is Defender => player instanceof Defender,
      "Защищающийся не найден",
    );
  }

  set defender(player: Player) {
    this.#changeKind(player, Defender);
  }

  set attacker(player: Player) {
    this.#changeKind(player, Attacker);
  }

  #changeKind(
    targetOfKindChange: Player,
    ParticularKind: { new (...args: any): Player | SuperPlayer },
  ) {
    if (targetOfKindChange.constructor === ParticularKind) return;
    const particularSuperKind = this.#value.find(
      (player): player is SuperPlayer =>
        player instanceof ParticularKind && player.constructor !== Player,
    );
    if (particularSuperKind) {
      this.#update(particularSuperKind, Player);
    }
    this.#update(targetOfKindChange, ParticularKind);
  }

  #update<OldPlayerKind extends Player>(
    targetOfUpdate: OldPlayerKind,
    ParticularKind: { new (...args: any): Player | SuperPlayer },
  ) {
    const playerIndex = this.#value.indexOf(targetOfUpdate);
    assert.ok(playerIndex > 0);
    const updatedTarget = new ParticularKind(targetOfUpdate);
    this.#value.splice(playerIndex, 1, updatedTarget);
  }

  get(cb: (player: Player) => boolean, notFoundMessage?: string): Player;
  get<SuperPlayerToFind extends SuperPlayer>(
    cb: (p: Player) => p is SuperPlayerToFind,
    notFoundMessage: string,
  ): SuperPlayerToFind;
  get(
    cb: (player: Player) => boolean,
    notFoundMessage = "Игрок не найден",
  ): Player {
    const player = this.#value.find(cb);
    assert.ok(player, notFoundMessage);
    return player;
  }

  remove(cb: (player: Player) => boolean, notRemovedMessage?: string): Player {
    const playerIndex = this.#value.findIndex(cb);
    assert.ok(playerIndex, notRemovedMessage);
    const [player] = this.#value.splice(playerIndex, 1);
    player.exitGame();
    return player;
  }
}
