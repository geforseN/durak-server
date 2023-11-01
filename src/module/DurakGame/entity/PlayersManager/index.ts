import { LobbyUserIdentifier } from "../../../../namespaces/lobbies/entity/lobby-users";
import { Player, Attacker, Defender, Players, PlayerKind } from "../Player";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";
import GamePlayersManagerService from "./PlayersManager.service";

export default class PlayersManager {
  private players: Players;
  private service?: GamePlayersManagerService;
  namespace!: DurakGameSocket.Namespace;

  constructor(players: Players) {
    this.players = players;
    this.defineSidePlayers();
  }

  makeAttacker(playerOrIdentifier: Player | LobbyUserIdentifier): Attacker {
    return this.make(Attacker, playerOrIdentifier);
  }

  makeDefender(playerOrIdentifier: Player | LobbyUserIdentifier): Defender {
    return this.make(Defender, playerOrIdentifier);
  }

  makePlayer(playerOrIdentifier: Player | LobbyUserIdentifier): Player {
    return this.make(Player, playerOrIdentifier);
  }

  makeNewAttacker(nextAttacker: Player | LobbyUserIdentifier) {
    this.makePlayer(this.players.attacker);
    return this.makeAttacker(nextAttacker);
  }

  makeNewDefender(nextDefender: Player | LobbyUserIdentifier): Defender {
    this.makePlayer(this.players.defender);
    return this.makeDefender(nextDefender);
  }

  private make<P extends Player>(
    Player: { new (player: Player): P },
    playerOrId: Player | LobbyUserIdentifier,
  ): P {
    const id = this.getId(playerOrId);
    const playerIndex = this.getPlayerIndex({ id });
    const player = new Player(this.players.getPlayer({ id }));
    const kind = Player.name as PlayerKind;
    this.service?.changeKind(kind, player);
    this.updateRefs(player, playerIndex);
    return player;
  }

  private getPlayerIndex({ id }: { id: string }): number {
    // used Symbol.iterator here
    return [...this.players].findIndex((player) => player.id === id);
  }

  getOrderedPlayerEnemies({ id }: { id: string }): Player[] {
    const enemies: Player[] = [];
    const player = this.players.getPlayer({ id });
    let enemy = player.left;
    while (enemy.id !== player.id) {
      enemies.push(enemy);
      enemy = enemy.left;
    }
    return enemies;
  }

  // TODO remove me
  private getId(playerOrId: Player | LobbyUserIdentifier): string {
    return playerOrId instanceof Player ? playerOrId.id : playerOrId.accname;
  }

  private defineSidePlayers(): void {
    // used Symbol.iterator here
    [...this.players].forEach((player, playerIndex, players) => {
      const sideIndexes = this.getSideIndexes(playerIndex);
      player.left = players[sideIndexes.leftPlayerIndex];
      player.right = players[sideIndexes.rightPlayerIndex];
    });
  }

  private getLeftPlayerIndex(index: number): number {
    const isLastPlayer = index === this.players.count - 1;
    return isLastPlayer ? 0 : index + 1;
  }

  private getRightPlayerIndex(index: number): number {
    const isFirstPlayer = index === 0;
    return isFirstPlayer ? this.players.count - 1 : index - 1;
  }

  private updateRefs<P extends Player>(instance: P, playerIndex: number) {
    const { leftPlayerIndex, rightPlayerIndex } =
      this.getSideIndexes(playerIndex);
    this.players.__value[playerIndex] = instance;
    this.players.__value[leftPlayerIndex].right = instance;
    this.players.__value[rightPlayerIndex].left = instance;
  }

  private getSideIndexes(playerIndex: number) {
    const leftPlayerIndex = this.getLeftPlayerIndex(playerIndex);
    const rightPlayerIndex = this.getRightPlayerIndex(playerIndex);
    return { leftPlayerIndex, rightPlayerIndex };
  }

  remove({ player }: { player: Player }) {
    const { left, right } = player;
    left.right = player.right;
    right.left = player.left;
    this.service?.exitGame(player);
  }

  injectService(playersManagerService: GamePlayersManagerService) {
    this.service = playersManagerService;
    this.namespace = playersManagerService.namespace;
  }
}
