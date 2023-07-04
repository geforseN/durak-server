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
        : players.#value.filter((player) => {
            if (player.hand.isEmpty) {
              player.exitGame();
              return false;
            }
            return true;
          });
    } else {
      const lobbyUsersArray = lobbyUsersArrayOrPlayers;
      this.#value = new PlayersWithIdentifiedSidePlayers(lobbyUsersArray).value;
    }
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  get count() {
    return this.#value.length;
  }

  get attacker(): Attacker {
    return this.#getSuperPlayerFromCallback(
      (player): player is Attacker => player instanceof Attacker,
      "Атакующий не найден",
    );
  }

  get defender(): Defender {
    return this.#getSuperPlayerFromCallback(
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

  // IF kinds are same THEN return
  // find old player index
  // put new player in index
  #changeKind<OldPlayer extends Player, NewPlayer extends SuperPlayer | Player>(
    targetOfKindChange: OldPlayer,
    ParticularKind: { new (player: OldPlayer): NewPlayer },
  ) {
    if (targetOfKindChange.constructor === ParticularKind) {
      return console.log(
        "Players#set fast return: kind to set is same as old kind",
      );
    }
    const playerIndex = this.#value.indexOf(targetOfKindChange);
    assert.ok(playerIndex !== -1);
    const updatedPlayer = new ParticularKind(targetOfKindChange);
    this.#value.splice(playerIndex, 1, updatedPlayer);
    const certainSuperPlayer = this.#value.find(
      (player): player is SuperPlayer =>
        player instanceof ParticularKind && player.constructor !== Player,
    );
    if (certainSuperPlayer && certainSuperPlayer !== updatedPlayer) {
      this.#changeKind(certainSuperPlayer, Player);
    }
    this.#changePlayerKindIfNeeded(targetOfKindChange, updatedPlayer);
  }

  #setPlayer<OldPlayerKind extends Player>(
    oldPlayer: OldPlayerKind,
    CertainPlayer = Player,
  ) {
    const playerIndex = this.#value.indexOf(oldPlayer);
    assert.ok(playerIndex !== -1);
    const updatedPlayer = new CertainPlayer(oldPlayer);
    this.#value.splice(playerIndex, 1, updatedPlayer);

    if (oldPlayer.constructor !== CertainPlayer) {
      const newKind = updatedPlayer.constructor.name;
      oldPlayer.changeKind(newKind);
    }
  }

  #changePlayerKindIfNeeded(oldPlayer: Player, updatedPlayer: Player) {
    const isKindHasChanged =
      oldPlayer.constructor !== updatedPlayer.constructor;
    if (isKindHasChanged) {
      const newKind = updatedPlayer.constructor.name;
      oldPlayer.changeKind(newKind);
    }
  }

  #getInstanceOf<PlayerToFind extends SuperPlayer>(
    PlayerToFind: {
      new (...arg: any): PlayerToFind;
    },
    notFoundMessage: string,
  ): PlayerToFind {
    const player = this.#value.find(
      (player): player is PlayerToFind => player instanceof PlayerToFind,
    );
    assert.ok(player, notFoundMessage);
    return player;
  }

  #getSuperPlayerFromCallback<PlayerToFind extends SuperPlayer>(
    cb: (p: Player) => p is PlayerToFind,
    notFoundMessage: string,
  ): PlayerToFind {
    const player = this.#value.find(cb);
    assert.ok(player, notFoundMessage);
    return player;
  }

  getPlayerById(id: string): Player {
    return this.get((player) => player.id === id);
  }

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

export class PlayersWithIdentifiedSidePlayers {
  value: Player[];

  constructor(lobbyUsersArray: LobbyUser[]) {
    this.value = lobbyUsersArray
      .map((user) => new Player(user))
      .map((player, index, players) => {
        const { leftPlayerIndex, rightPlayerIndex } = new SidePlayersIndexes(
          index,
          players.length,
        );
        player.left = players[leftPlayerIndex];
        player.right = players[rightPlayerIndex];
        return player;
      });
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

export class NonEmptyPlayers {
  value: Player[];
  constructor(players: Players) {
    this.value = [...players].filter((player) => {
      if (!player.hand.isEmpty) {
        return true;
      }
      player.exitGame();
      return false;
    });
  }
}
