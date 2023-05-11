import DurakGame from "../DurakGame";
import SelfDTO from "./Self.dto";
import EnemyDTO from "./Enemy.dto";

export default class DurakGameStateDto {
  self: SelfDTO;
  enemies: EnemyDTO[];
  deskSlots: DurakGame["desk"]["slots"];
  trumpCard: DurakGame["talon"]["trumpCard"];
  allowedPlayerId: string;
  isDiscardEmpty: boolean;
  isTalonEmpty: boolean;
  isTalonHasOneCard: boolean;
  isDefenderGaveUp: boolean;
  playersCount: number;
  roundNumber: number;

  constructor(game: DurakGame, playerId: string) {
    const currentPlayer = game.players.getPlayer({ id: playerId });
    this.self = new SelfDTO(currentPlayer);
    this.enemies = this.getOrderedEnemies(currentPlayer);
    this.deskSlots = game.desk.slots;
    this.trumpCard = game.talon.trumpCard;
    this.allowedPlayerId = game.round.currentMove.player.id;
    this.isDiscardEmpty = game.discard.count === 0;
    this.isTalonEmpty = game.talon.isEmpty;
    this.isTalonHasOneCard = game.talon.count === 1;
    this.playersCount = game.settings.maxUserCount;
    this.roundNumber = game.round.number;
    this.isDefenderGaveUp = game.round.isDefenderGaveUp;
  }

  private getOrderedEnemies(player: ReturnType<DurakGame["players"]["getPlayer"]>) {
    const enemies: EnemyDTO[] = [];
    let enemy = player.left;
    while (enemy.id !== player.id) {
      enemies.push(new EnemyDTO(enemy));
      enemy = enemy.left;
    }
    return enemies;
  }
}
