import { LobbyUserIdentifier } from "../../../namespaces/lobbies/entity/lobby-users";
import { Player, Attacker, Defender, Players } from "./index";
import { GamesIO, PlayerRole } from "../../../namespaces/games/games.types";
import GamePlayersManagerService from "../Services/PlayersManager.service";

export default class PlayersManager {
  private players: Players;
  private service?: GamePlayersManagerService;
  namespace!: GamesIO.NamespaceIO;

  constructor(players: Players) {
    this.players = players;
    this.defineSidePlayers();
  }

  removeEmptyPlayers() {
    const newPlayers: Player[] = [];
    for (const player of this.players.__value) {
      if (player.hand.isEmpty) {
        this.remove({ player });
      } else {
        newPlayers.push(player);
      }
    }
    this.players.__value = newPlayers;
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
    Player: { new(player: Player): P },
    playerOrId: Player | LobbyUserIdentifier,
  ): P {
    const id = this.getId(playerOrId);
    const playerIndex = this.getPlayerIndex({ id });
    const player = new Player(this.players.__value[playerIndex]);
    const role = Player.name as PlayerRole;
    this.service?.changeRole(role, player);
    this.updateRefs(player, playerIndex);
    return player;
  }

  getPlayerIndex({ id }: { id: string }): number {
    return this.players.__value.findIndex((player) => player.id === id);
  }

  getPlayerEnemies({ id }: { id: string }): Player[] {
    return this.players.__value.filter((player) => player.id !== id);
  }

  private getId(playerOrId: Player | LobbyUserIdentifier): string {
    return playerOrId instanceof Player
      ? playerOrId.id
      : playerOrId.accname;
  }

  private defineSidePlayers(): void {
    this.players.__value.forEach((player, playerIndex, players) => {
      const {
        leftPlayerIndex,
        rightPlayerIndex,
      } = this.getSideIndexes(playerIndex);
      player.left = players[leftPlayerIndex];
      player.right = players[rightPlayerIndex];
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
    const { leftPlayerIndex, rightPlayerIndex } = this.getSideIndexes(playerIndex);
    this.players.__value[playerIndex] = instance;
    this.players.__value[leftPlayerIndex].right = instance;
    this.players.__value[rightPlayerIndex].left = instance;
  }

  private getSideIndexes(playerIndex: number) {
    const leftPlayerIndex = this.getLeftPlayerIndex(playerIndex);
    const rightPlayerIndex = this.getRightPlayerIndex(playerIndex);
    return { leftPlayerIndex, rightPlayerIndex };
  }

  private remove({ player }: { player: Player }) {
    const { left, right } = player;
    left.right = player.right;
    right.left = player.left;
    this.service?.removeFromGame(player);
  }

  injectService(playersManagerService: GamePlayersManagerService) {
    this.service = playersManagerService;
    this.namespace = playersManagerService.namespace;
  }
}