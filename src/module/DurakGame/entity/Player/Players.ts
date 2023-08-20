import assert from "node:assert";
import GamePlayerWebsocketService from "./Player.service";
import { Attacker, Defender, Player, SuperPlayer } from "./index";
import SidePlayersIndexes from "./SidePlayersIndexes";
import DurakGame from "../../DurakGame";

export default class Players {
  readonly value: Player[];

  constructor(
    nonStartedGamePlayers: Player[],
    wsPlayerService: GamePlayerWebsocketService,
  );
  constructor(game: DurakGame);
  constructor(
    playersOrGame: DurakGame | Player[],
    wsPlayerService?: GamePlayerWebsocketService,
  ) {
    if (playersOrGame instanceof DurakGame) {
      const game = playersOrGame;
      this.value = game.players.value.reduce(
        (nonEmptyPlayers: Player[], player) => {
          if (player.hand.isEmpty) {
            player.exitGame(game);
          } else {
            nonEmptyPlayers.push(player);
          }
          return nonEmptyPlayers;
        },
        [],
      );
    } else if (
      Array.isArray(playersOrGame) &&
      wsPlayerService instanceof GamePlayerWebsocketService
    ) {
      const nonStartedGamePlayers = playersOrGame;
      this.value = nonStartedGamePlayers.map(
        (player) => new Player(player, wsPlayerService),
      );
      this.value.forEach((player, index, players) => {
        const indexes = new SidePlayersIndexes(index, players.length);
        player.left = players[indexes.leftPlayerIndex];
        player.right = players[indexes.rightPlayerIndex];
      });
    } else {
      throw new Error("Players constructor failure");
    }
  }

  *[Symbol.iterator]() {
    yield* this.value;
  }

  get count() {
    return this.value.length;
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
    target: Player,
    ParticularKind: { new (...args: any): Player | SuperPlayer },
  ) {
    if (target.constructor === ParticularKind) return;
    const particularSuperKind = this.value.find(
      (player): player is SuperPlayer =>
        player instanceof ParticularKind && player.constructor !== Player,
    );
    if (particularSuperKind) {
      this.#update(particularSuperKind, Player);
    }
    this.#update(target, ParticularKind);
  }

  #update<OldPlayerKind extends Player>(
    target: OldPlayerKind,
    ParticularKind: { new (...args: any): Player | SuperPlayer },
  ) {
    const playerIndex = this.value.indexOf(target);
    assert.ok(playerIndex >= 0);
    const updatedTarget = new ParticularKind(target);
    this.value.splice(playerIndex, 1, updatedTarget);
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
    const player = this.value.find(cb);
    assert.ok(player, notFoundMessage);
    return player;
  }

  remove(
    cb: (player: Player) => boolean,
    game: DurakGame,
    notRemovedMessage?: string,
  ): Player {
    const playerIndex = this.value.findIndex(cb);
    assert.ok(playerIndex, notRemovedMessage);
    const [player] = this.value.splice(playerIndex, 1);
    player.exitGame(game);
    return player;
  }
}
