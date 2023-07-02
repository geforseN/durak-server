import assert from "node:assert";
import { Attacker, Defender, Player, SuperPlayer } from "./index";
import { LobbyUser } from "../../../Lobbies/lobbies.namespace";
import GamePlayersWebsocketService from "./Players.service";
import GamePlayerService from "./Player.service";

export default class Players {
  #value: Player[];
  #websocketService?: GamePlayersWebsocketService;

  constructor(
    userArrayOrPlayers: LobbyUser[] | Players,
    wsService?: GamePlayersWebsocketService,
  ) {
    if (userArrayOrPlayers instanceof Players) {
      const players = userArrayOrPlayers;
      this.#value = [...players].filter((player) => {
        if (!player.hand.isEmpty) {
          return true;
        }
        player.left.right = player.right;
        player.right.left = player.left;
        this.#websocketService?.exitGame(player);
        return false;
      });
      this.#websocketService = players.#websocketService || wsService;
    } else {
      const usersArray = userArrayOrPlayers;
      this.#value = usersArray
        .map((user) => new Player(user))
        .map((player, index, players) => {
          const { leftPlayerIndex, rightPlayerIndex } = new SideIndexes(
            index,
            players.length,
          );
          player.left = players[leftPlayerIndex];
          player.right = players[rightPlayerIndex];
          return player;
        });
      this.#websocketService = undefined;
    }
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  get count() {
    return this.#value.length;
  }

  get attacker(): Attacker {
    return this.#get(Attacker, "Атакующий не найден");
    // return this.#get2((player) => player instanceof Attacker, "Атакующий не найден");
  }

  get defender(): Defender {
    return this.#get(Defender, "Защищающийся не найден");
    // return this.#get2((player) => player instanceof Defender, "Защищающийся не найден");
  }

  set defender(player: Player) {
    this.#set(player, Defender);
  }

  set attacker(player: Player) {
    this.#set(player, Attacker);
  }

  #set<NewPlayerKind extends Player, OldPlayerKind extends Player>(
    unupdatedPlayer: OldPlayerKind,
    CertainPlayer: { new (player: OldPlayerKind): NewPlayerKind },
  ): NewPlayerKind {
    const updatedPlayer = new CertainPlayer(unupdatedPlayer);
    const nonBasicCertainPlayer = [...this].find(
      (player) =>
        player instanceof CertainPlayer && !(player.constructor !== Player),
    );
    if (nonBasicCertainPlayer && nonBasicCertainPlayer !== updatedPlayer) {
      this.#set(nonBasicCertainPlayer, Player);
    }
    if (unupdatedPlayer.constructor !== updatedPlayer.constructor) {
      this.#websocketService?.changeKind(CertainPlayer.name, updatedPlayer);
    }
    return updatedPlayer;
  }

  #get<PlayerToFind extends SuperPlayer>(
    PlayerToFind: {
      new (...arg: any): PlayerToFind;
    },
    notFoundMessage: string,
  ): PlayerToFind {
    const player = [...this].find((player) => player instanceof PlayerToFind);
    assert.ok(player, notFoundMessage);
    assert.ok(player instanceof PlayerToFind, "TypeScript");
    return player;
  }

  getPlayer({ id }: { id: string }): Player {
    const player = [...this].find((player) => player.id === id);
    assert.ok(player, "Игрок не найден");
    return player;
  }

  injectService(
    playersService: GamePlayersWebsocketService,
    playerService: GamePlayerService,
  ) {
    this.#websocketService = playersService;
    [...this].forEach((player) => player.injectService(playerService));
  }
}

export class OrderedPlayerEnemies {
  #value: Player[];

  constructor(player: Player) {
    this.#value = [];
    let enemy = player.left;
    while (enemy.id !== player.id) {
      this.#value.push(enemy);
      enemy = enemy.left;
    }
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }
}

export class SideIndexes {
  constructor(private playerIndex: number, private playersCount: number) {}
  get leftPlayerIndex() {
    const isLastPlayer = this.playerIndex === this.playersCount - 1;
    return isLastPlayer ? 0 : this.playerIndex + 1;
  }
  get rightPlayerIndex() {
    const isFirstPlayer = this.playerIndex === 0;
    return isFirstPlayer ? this.playersCount - 1 : this.playerIndex - 1;
  }
}
