import DurakGame from "../DurakGame";
import SelfDTO from "./Self.dto";
import EnemyDTO from "./Enemy.dto";

export default class GameState {
  self: SelfDTO;
  enemies: EnemyDTO[];
  deskSlots: DurakGame["desk"]["slots"]
  trumpCard: DurakGame["talon"]["trumpCard"];
  allowedPlayerId: string;

  constructor(game: DurakGame, playerId: string) {
    const id = playerId;
    this.self = new SelfDTO(game.players.getPlayer({ id }));
    this.enemies = game.players.manager.getPlayerEnemies({ id }).map(((enemy) => new EnemyDTO(enemy)));
    this.deskSlots = game.desk.slots;
    this.trumpCard = game.talon.trumpCard;
    this.allowedPlayerId = game.round.currentMove.player.id;
  }
}