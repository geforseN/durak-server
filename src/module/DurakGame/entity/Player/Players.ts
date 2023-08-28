import assert from "node:assert";
import type DurakGame from "../../DurakGame";
import { NonLinkedGamePlayer, NonStartedGameUser } from "./Player";
import type GamePlayerWebsocketService from "./Player.service";
import SidePlayersIndexes from "./SidePlayersIndexes";
import { Attacker, Defender, Player, SuperPlayer } from "./index";

export default abstract class Players {
  readonly value: Player[];

  constructor(value: Player[]) {
    this.value = value;
  }

  *[Symbol.iterator]() {
    yield* this.value;
  }

  get count() {
    return this.value.length;
  }

  get attacker(): Attacker {
    return this.get<Attacker>(
      (player): player is Attacker => player.isAttacker(),
      "Атакующий не найден",
    );
  }

  get defender(): Defender {
    return this.get<Defender>(
      (player): player is Defender => player.isDefender(),
      "Защищающийся не найден",
    );
  }

  set defender(player: Player) {
    if (player.isDefender()) return;
    const defender = this.value.find((player) => player.isDefender());
    if (defender) this.#update(defender, Player);
    this.#update(player, Defender);
  }

  set attacker(player: Player | SuperPlayer) {
    if (player.isAttacker()) return;
    const attacker = this.value.find((player) => player.isAttacker());
    if (attacker) this.#update(attacker, Player);
    this.#update(player, Attacker);
  }

  #update(target: Player, ParticularKind: typeof Player) {
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

export class NonEmptyPlayers extends Players {
  constructor(game: DurakGame) {
    super(
      game.players.value.reduce((nonEmptyPlayers: Player[], player) => {
        if (player.hand.isEmpty) {
          player.exitGame(game);
        } else {
          nonEmptyPlayers.push(player);
        }
        return nonEmptyPlayers;
      }, []),
    );
  }
}

// ! Player#left & Player#right is buggy, should add test !
// TODO: add test
export class StartedDurakGamePlayers extends Players {
  constructor(
    nonStartedGameUsers: NonStartedGameUser[],
    wsPlayerService: GamePlayerWebsocketService,
  ) {
    super(
      nonStartedGameUsers
        .map((player) => new NonLinkedGamePlayer(player, wsPlayerService))
        .map((player) => new Player(player)),
    );
    this.value.forEach((player, index, players) => {
      const indexes = new SidePlayersIndexes(index, players.length);
      player.left = players[indexes.leftPlayerIndex];
      player.right = players[indexes.rightPlayerIndex];
    });
  }
}
