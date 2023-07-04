import assert from "node:assert";
import { Attacker, Defender, Player, SuperPlayer } from "./index";
import { LobbyUser } from "../../../Lobbies/lobbies.namespace";
import GamePlayerWebsocketService from "./Player.service";

export default class Players {
  #value: Player[];

  constructor(lobbyUsersArray: LobbyUser[]);
  constructor(players: Players, wsPlayerService: GamePlayerWebsocketService);
  constructor(players: Players);
  constructor(
    lobbyUsersArrayOrPlayers: LobbyUser[] | Players,
    wsPlayerService?: GamePlayerWebsocketService,
  ) {
    if (lobbyUsersArrayOrPlayers instanceof Players) {
      const players = lobbyUsersArrayOrPlayers;
      this.#value = wsPlayerService
        ? players.#value.map((player) => new Player(player, wsPlayerService))
        : players.#value.reduce((nonEmptyPlayers: Player[], player) => {
            player.hand.isEmpty
              ? player.exitGame()
              : nonEmptyPlayers.push(player);
            return nonEmptyPlayers;
          }, []);
    } else {
      const lobbyUsersArray = lobbyUsersArrayOrPlayers;
      this.#value = lobbyUsersArray.map((user) => new Player(user));
      this.#value.forEach((player, index, players) => {
        const indexes = new SidePlayersIndexes(index, players.length);
        player.left = players[indexes.leftPlayerIndex];
        player.right = players[indexes.rightPlayerIndex];
      });
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
    if (targetOfKindChange.constructor === ParticularKind) {
      return console.log(
        "Players#set fast return: targetOfKindChange already have ParticularKind",
      );
    }
    const particularSuperKind = this.#value.find(
      (player): player is SuperPlayer =>
        player instanceof ParticularKind && player.constructor !== Player,
    );
    if (!particularSuperKind) {
      return console.log(`No ${ParticularKind.name} was found`);
    } else {
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
    updatedTarget.changeKindTo(ParticularKind);
    return updatedTarget;
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
}
export class OrderedPlayerEnemies {
  value: Player[];

  constructor(player: Player) {
    this.value = [];
    let enemy = player.left;
    while (enemy.id !== player.id) {
      this.value.push(enemy);
      enemy = enemy.left;
    }
  }
}

export class SidePlayersIndexes {
  constructor(public playerIndex: number, public playersCount: number) {}
  get leftPlayerIndex() {
    const isLastPlayer = this.playerIndex === this.playersCount - 1;
    return isLastPlayer ? 0 : this.playerIndex + 1;
  }
  get rightPlayerIndex() {
    const isFirstPlayer = this.playerIndex === 0;
    return isFirstPlayer ? this.playersCount - 1 : this.playerIndex - 1;
  }
}
